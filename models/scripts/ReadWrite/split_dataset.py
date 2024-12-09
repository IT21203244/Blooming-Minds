import os
import random
import shutil

# Paths
source_dir = "E:/Research Project (IT4010)-24-25July batch/4. Progress Presentation/MyDataSet/Dataset"  
train_dir = "Dataset_Train"
val_dir = "Dataset_Validation"
test_dir = "Dataset_Test"

# Ratios for splitting
train_ratio = 0.7
val_ratio = 0.15
test_ratio = 0.15

def create_split_folders():
    # Create train, validation, and test folders
    for folder in [train_dir, val_dir, test_dir]:
        for case in ['Uppercase', 'Lowercase']:
            for letter in os.listdir(os.path.join(source_dir, case)):
                os.makedirs(os.path.join(folder, case, letter), exist_ok=True)

def split_data():
    for case in ['Uppercase', 'Lowercase']:
        for letter in os.listdir(os.path.join(source_dir, case)):
            letter_path = os.path.join(source_dir, case, letter)
            if not os.path.isdir(letter_path):
                continue
            
            files = os.listdir(letter_path)
            random.shuffle(files)

            # Split files
            train_count = int(len(files) * train_ratio)
            val_count = int(len(files) * val_ratio)

            train_files = files[:train_count]
            val_files = files[train_count:train_count + val_count]
            test_files = files[train_count + val_count:]

            # Move files
            move_files(letter_path, train_files, os.path.join(train_dir, case, letter))
            move_files(letter_path, val_files, os.path.join(val_dir, case, letter))
            move_files(letter_path, test_files, os.path.join(test_dir, case, letter))

def move_files(source_folder, files, destination_folder):
    for file in files:
        shutil.move(os.path.join(source_folder, file), os.path.join(destination_folder, file))

# Execute the script
if __name__ == "__main__":
    create_split_folders()
    split_data()
