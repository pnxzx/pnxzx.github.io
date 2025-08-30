data = ""
# 构建动态生成的 HTML 页面
with open("index.html.txt", "r",encoding='utf-8') as f:  # 打开文件
    data = f.read()  # 读取文件
    print(data)
