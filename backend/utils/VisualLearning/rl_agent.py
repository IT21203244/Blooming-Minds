import numpy as np
import random
from collections import deque
from keras.models import Sequential
from keras.layers import Dense, Input
from keras.optimizers import Adam
import logging
import matplotlib.pyplot as plt  # For visualization

# Set up logging for convergence testing
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RLAgent:
    def __init__(self, state_size, action_size, model_path=None):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=2000)
        self.gamma = 0.95  # Discount factor
        self.epsilon = 1.0  # Exploration rate
        self.epsilon_decay = 0.995
        self.epsilon_min = 0.01
        self.learning_rate = 0.001
        self.model = self._build_model()
        self.total_rewards = []  # Track total rewards per episode
        self.epsilon_values = []  # Track epsilon values per episode
        self.loss_values = []  # Track loss values during training
        if model_path:
            self.model.load_weights(model_path)

    def _build_model(self):
        model = Sequential([
            Input(shape=(self.state_size,)),
            Dense(24, activation='relu'),
            Dense(24, activation='relu'),
            Dense(self.action_size, activation='linear')
        ])
        model.compile(loss='mse', optimizer=Adam(learning_rate=self.learning_rate))
        return model

    def save_model(self, model_path):
        # Save model architecture and weights
        self.model.save(model_path)
        logger.info(f"Model saved to {model_path}")

    def load_model(self, model_path):
        # Load model architecture and weights
        self.model.load_weights(model_path)

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def act(self, state):
        state = np.expand_dims(state, axis=0)  # Ensure correct shape
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)  # Exploration
        act_values = self.model.predict(state)
        return np.argmax(act_values[0])  # Exploitation

    def replay(self, batch_size):
        if len(self.memory) < batch_size:
            return

        minibatch = random.sample(self.memory, batch_size)
        loss = 0
        for state, action, reward, next_state, done in minibatch:
            state = np.expand_dims(state, axis=0)
            next_state = np.expand_dims(next_state, axis=0)
            target = reward

            if not done:
                target = reward + self.gamma * np.amax(self.model.predict(next_state)[0])
            target_f = self.model.predict(state)
            target_f[0][action] = target
            history = self.model.fit(state, target_f, epochs=1, verbose=0)
            loss += history.history['loss'][0]

        self.loss_values.append(loss / batch_size)  # Average loss for the minibatch

        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

        # Log epsilon value
        logger.info(f"Current epsilon: {self.epsilon:.4f}")

    def train_agent(self, env, episodes, batch_size, model_path):
        for e in range(episodes):
            state = env.reset()
            total_reward = 0
            for time in range(500):  # Max steps per episode
                action = self.act(state)
                next_state, reward, done, _ = env.step(action)
                self.remember(state, action, reward, next_state, done)
                state = next_state
                total_reward += reward
                if done:
                    break

            self.total_rewards.append(total_reward)  # Track rewards per episode
            self.epsilon_values.append(self.epsilon)  # Track epsilon per episode

            self.replay(batch_size)

            # Save the model periodically or after each episode
            if (e + 1) % 10 == 0:  # Save model every 10 episodes (you can change this interval)
                self.save_model(model_path)
            
            logger.info(f"Episode {e + 1}/{episodes}, Reward: {total_reward}")

    def plot_metrics(self):
        # Plot total reward, epsilon, and loss
        episodes = range(1, len(self.total_rewards) + 1)

        plt.figure(figsize=(15, 5))

        # Total Rewards
        plt.subplot(1, 3, 1)
        plt.plot(episodes, self.total_rewards, label='Total Reward')
        plt.xlabel('Episode')
        plt.ylabel('Reward')
        plt.title('Total Reward per Episode')
        plt.legend()

        # Epsilon Decay
        plt.subplot(1, 3, 2)
        plt.plot(episodes, self.epsilon_values, label='Epsilon', color='orange')
        plt.xlabel('Episode')
        plt.ylabel('Epsilon')
        plt.title('Epsilon Decay')
        plt.legend()

        # Loss
        plt.subplot(1, 3, 3)
        plt.plot(episodes, self.loss_values, label='Loss', color='green')
        plt.xlabel('Episode')
        plt.ylabel('Loss')
        plt.title('Loss per Episode')
        plt.legend()

        plt.tight_layout()
        plt.show()
