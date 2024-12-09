import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
from tensorflow.keras.preprocessing.image import ImageDataGenerator

def evaluate_model(model_path, test_generator):
    # Load the trained model
    model = load_model(model_path)

    # Predict on the test set
    y_true = test_generator.classes
    y_pred_probs = model.predict(test_generator, steps=len(test_generator))
    y_pred_classes = np.argmax(y_pred_probs, axis=1)

    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred_classes)
    print("\nClassification Report:\n")
    print(classification_report(y_true, y_pred_classes, target_names=list(test_generator.class_indices.keys())))

    # Save Predictions for Analysis
    results = pd.DataFrame({
        'True_Label': y_true,
        'Predicted_Label': y_pred_classes
    })
    results.to_csv('evaluation_results.csv', index=False)
    print("Evaluation results saved as 'evaluation_results.csv'.")

    # Visualize and Save Confusion Matrix
    plt.figure(figsize=(10, 7))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=test_generator.class_indices.keys(),
                yticklabels=test_generator.class_indices.keys())
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix')
    plt.savefig('confusion_matrix.png')
    print("Confusion matrix saved as 'confusion_matrix.png'.")

    # Normalized Confusion Matrix
    cm_normalized = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
    plt.figure(figsize=(10, 7))
    sns.heatmap(cm_normalized, annot=True, fmt=".2f", cmap="Blues",
                xticklabels=test_generator.class_indices.keys(),
                yticklabels=test_generator.class_indices.keys())
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Normalized Confusion Matrix')
    plt.savefig('normalized_confusion_matrix.png')
    print("Normalized confusion matrix saved as 'normalized_confusion_matrix.png'.")

    # Top-K Accuracy (e.g., Top-5)
    top_k_accuracy = np.mean([y_true[i] in np.argsort(y_pred_probs[i])[-5:] for i in range(len(y_true))])
    print(f"Top-5 Accuracy: {top_k_accuracy:.4f}")

    # Class-Wise Metrics for Low Performance
    report = classification_report(y_true, y_pred_classes, target_names=list(test_generator.class_indices.keys()), output_dict=True)
    low_performance_classes = {cls: metrics for cls, metrics in report.items() if isinstance(metrics, dict) and metrics['f1-score'] < 0.5}
    print("\nClasses with F1-score < 0.5:\n", low_performance_classes)

    # ROC Curves for Binary or Multi-Class (One-vs-Rest)
    plt.figure(figsize=(10, 7))
    for i, class_name in enumerate(test_generator.class_indices.keys()):
        fpr, tpr, _ = roc_curve(y_true == i, y_pred_probs[:, i])
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, label=f'{class_name} (AUC = {roc_auc:.2f})')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curves')
    plt.legend()
    plt.savefig('roc_curves.png')
    print("ROC curves saved as 'roc_curves.png'.")

    # Class Distribution
    class_counts = np.bincount(y_true)
    plt.figure(figsize=(10, 7))
    plt.bar(range(len(class_counts)), class_counts)
    plt.xticks(range(len(class_counts)), list(test_generator.class_indices.keys()), rotation=90)
    plt.title("Class Distribution in Test Data")
    plt.savefig('class_distribution.png')
    print("Class distribution saved as 'class_distribution.png'.")

if __name__ == "__main__":
    # Paths
    model_path = 'E:/BloomingMinds/ml-models/saved_models/fine_tuning/final_model_vgg16.keras'
    test_dir = 'E:/BloomingMinds/ml-models/datasets/Preprocessed_Test'

    # Create test data generator (same as in train_model.py)
    img_width, img_height = 128, 128
    batch_size = 32
    test_datagen = ImageDataGenerator(rescale=1./255)
    test_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=(img_width, img_height),
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=False  # Do not shuffle for evaluation
    )

    # Evaluate the model
    evaluate_model(model_path, test_generator)
