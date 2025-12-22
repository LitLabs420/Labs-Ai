# Merged Repositories

This directory contains repositories that have been merged into Labs-Ai using the **subdirectory merge strategy**.

## Merged Repositories

### ✅ Successfully Merged

1. **LiTreeStudio/** - Complete
   - Source: https://github.com/LiTree89/LiTreeStudio
   - Language: JavaScript
   - Description: First complete zip pack, new home base

2. **Labs-OS/** - Complete
   - Source: https://github.com/LiTree89/Labs-OS
   - Language: TypeScript
   - Description: Labs OS project

### ⏳ Pending Merge (Requires Access)

The following repositories require authentication or proper access permissions:

3. **dev** - https://github.com/LiTree89/dev
4. **azuredev-5d2f** - https://github.com/LiTree89/azuredev-5d2f
5. **studio** - https://github.com/LiTree89/studio
6. **LitreeLabsFirebase** - https://github.com/LiTree89/LitreeLabsFirebase
7. **my_first_rust_app** - https://github.com/LiTree89/my_first_rust_app

To merge these repositories, you'll need to:
1. Ensure they are public, OR
2. Clone them manually with proper credentials
3. Copy them to this directory (without .git folders)

## Structure

Each repository maintains its original structure within its own subdirectory:

```
merged-repos/
├── LiTreeStudio/
│   ├── [original files and structure]
│   └── ...
├── Labs-OS/
│   ├── [original files and structure]
│   └── ...
└── README.md (this file)
```

## How to Add More Repositories

To add another repository to this merged collection:

1. Clone the repository:
   ```bash
   git clone https://github.com/[USER]/[REPO_NAME].git /tmp/[REPO_NAME]
   ```

2. Copy to merged-repos (without .git):
   ```bash
   cp -r /tmp/[REPO_NAME] ./merged-repos/
   rm -rf ./merged-repos/[REPO_NAME]/.git
   ```

3. Commit the changes:
   ```bash
   git add merged-repos/[REPO_NAME]
   git commit -m "Merge [REPO_NAME] repository"
   ```

## Notes

- Git history from source repositories is not preserved (to keep the main repo manageable)
- Each repository is self-contained and can be accessed independently
- No dependencies between merged repositories
- Original repositories remain unchanged on GitHub

## Maintenance

- Update a merged repo: Replace its directory with a fresh clone
- Remove a merged repo: Simply delete its directory
- The main Labs-Ai codebase remains in the parent directory
