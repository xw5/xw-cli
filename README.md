Wps CLI是专为wps专题项目搭建的前端项目模板生成工具！


### 安装

``` javascript
    npm install -g wps-cli
```

### 使用

```
    wps create <project-name>
```

### 例如

```
    wps create mobile_sign_v2
```
上面的命令会在当前目录下新建一个名为mobile_sign_v2的项目，用户通过选择不同选项，命令会自动从GITHUB下载指定的模板文件。

模板生成选项如下：

    ? 选择模块化开发方式
    > 使用(AMD)requirejs管理
    > 使用(Commonjs)webpack管理
    > 使用es6 module

    ? 选择CSS预处理
    > 使用less管理css
    > 使用sass管理css

    ? 选择文件版本管理方式
    > example.js?v=md5码，加search值版本管理方式
    > example.md5.js码，修改文件名的版本管理方式

模块项目运行步骤：

```
    cd <project-name>
    npm install         //安装模块
    npm run dev         //走开发流程
    npm run build      //走发布流程
```
