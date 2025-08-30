from flask import Flask,render_template,views

app = Flask(__name__)

# 定义父视图类继承基类View
class Ads(views.View):
    def __init__(self):
        super(Ads, self).__init__()
        # 实例属性
        self.context={
            'ads':'这是对联广告！'
        }

# 定义子视图类继承父类并实现工程
class Index(Ads):
    def dispatch_request(self):
        # 字典传参方式==不定长的关键字传参
        return render_template('index.html',**self.context)
class fof(Ads):
    def dispatch_request(self):
        # 字典传参方式==不定长的关键字传参
        return render_template('404.html',**self.context)

# 注册我们创建的类视图,as_view给类视图起名
app.add_url_rule(rule='/',endpoint='index',view_func=Index.as_view('index'))
app.add_url_rule(rule='/404.html',endpoint='404',view_func=fof.as_view('404'))
# app.add_url_rule(rule='/login/',endpoint='login',view_func=Login.as_view('login'))
# app.add_url_rule(rule='/register/',endpoint='register',view_func=Register.as_view('register'))

if __name__=='__main__':
    print(app.view_functions)
    app.run(port=4514,debug=True)

