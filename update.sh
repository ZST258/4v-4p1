#!/bin/bash

# 设置GitHub仓库信息
repo_name="4v-4pi"
branch_name="main"
github_username="ZST258"
github_token="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"

# 切换到项目根目录
cd /api-project

# 强制上传项目到GitHub仓库
git add .
git commit -m "Daily update $(date +\%Y-\%m-\%d)"
git push "https://${github_username}:${github_token}@github.com/${github_username}" "$branch_name"

# 拉取最新版本
git pull "https://${github_username}:${github_token}@github.com/${github_username}" "$branch_name"

echo "项目已更新并上传到GitHub仓库，最新版本已拉取"

