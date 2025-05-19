import numpy as np
import random
from collections import deque
from keras.models import Sequential
from keras.layers import Dense, Input
from keras.optimizers import Adam
import logging
import matplotlib.pyplot as plt

# Set up logging
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
        self.total_rewards = []
        self.epsilon_values = []
        self.loss_values = []
        if model_path:
            self.model.load_weights(model_path)

    def _build_model(self):
        model = Sequential([
            Input(shape=(self.state_size,)),
            Dense(64, activation='relu'),
            Dense(64, activation='relu'),
            Dense(self.action_size, activation='linear')
        ])
        model.compile(
            loss='mse',
            optimizer=Adam(learning_rate=self.learning_rate),
            metrics=['accuracy']
        )
        return model

    def save_model(self, model_path):
        self.model.save(model_path)
        logger.info(f"Model saved to {model_path}")

    def load_model(self, model_path):
        self.model.load_weights(model_path)

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def act(self, state):
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)  # Exploration
        act_values = self.model.predict(np.array([state]), verbose=0)
        return np.argmax(act_values[0])  # Exploitation

    def replay(self, batch_size):
        if len(self.memory) < batch_size:
            return

        minibatch = random.sample(self.memory, batch_size)
        states = np.array([x[0] for x in minibatch])
        actions = np.array([x[1] for x in minibatch])
        rewards = np.array([x[2] for x in minibatch])
        next_states = np.array([x[3] for x in minibatch])
        dones = np.array([x[4] for x in minibatch])

        targets = self.model.predict(states, verbose=0)
        next_q_values = self.model.predict(next_states, verbose=0)

        for i in range(len(minibatch)):
            if dones[i]:
                targets[i][actions[i]] = rewards[i]
            else:
                targets[i][actions[i]] = rewards[i] + self.gamma * np.amax(next_q_values[i])

        history = self.model.fit(states, targets, epochs=1, verbose=0)
        self.loss_values.append(history.history['loss'][0])

        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    def plot_metrics(self):
        import matplotlib.pyplot as plt
        episodes = range(1, len(self.total_rewards) + 1)

        plt.figure(figsize=(15, 5))

        plt.subplot(1, 3, 1)
        plt.plot(episodes, self.total_rewards)
        plt.title('Total Rewards')
        plt.xlabel('Episode')

        plt.subplot(1, 3, 2)
        plt.plot(episodes, self.epsilon_values)
        plt.title('Epsilon')
        plt.xlabel('Episode')

        plt.subplot(1, 3, 3)
        plt.plot(episodes, self.loss_values)
        plt.title('Loss')
        plt.xlabel('Episode')

        plt.tight_layout()
        plt.show()
