#! /usr/bin/env node
const commander = require('commander');//命令行库
const shelljs = require('shelljs');//linux工具包
const chalk = require('chalk');//命令行样式
const inquirer = require('inquirer');//命令行选择库
const ora = require('ora');//命令行loading效果
const download = require('download-git-repo');//下载库
const figlet = require('figlet');//输出特殊字符

let isReplace = false;//是否是替换文件状态
let existName = '';//重复的工程名
let backUpName = '';//备份的工程名

//设置版本号
commander.version('v1.0.0','-v,--version');

//新增option --name后面的[val]]当前这个选项的参数值 []可选<>必填
//如果第三个参数为一个函数，会接受来处用户的值并返回一个值做为实际的值
commander.option('-n,--name [name]','设置名称',val => val.toLowerCase(),'zmouse');

//添加子命令
let createCommnader = commander.command('create <project-name>');

createCommnader.description(chalk.blue('创建开发项目'));
createCommnader.action((projectName)=>{
    slectActionBefore(projectName);
})

//设置命令的动作
commander.action(() => {
    console.log('hello '+commander.name);
})

//解析来自process.argv上的数据
commander.parse(process.argv);

//下载模板逻辑实现
function downloadTemplate(dir){
    const loadingCli = ora(chalk.gray(`Loading ${dir},请稍等...\r\n`)).start();
    download('github:xw5/devEnv_multipage',dir+'/',(err)=>{
        //删除git配置
        shelljs.rm(dir+'/.gitignore');
        figlet('WPS-CLI', function(err,data){
            if(!err){
                console.log(chalk.green(data));
            }
            loadingCli.clear();
            loadingCli.succeed(chalk.green(`${dir}项目模板已下载成功！`));
            console.log('\r\n');
            console.log(chalk.blue('------------------项目运行步骤说明start---------------------'));
            console.log('\r\n');
            console.log(chalk.blue(`    1.cd ${dir}`));
            console.log(chalk.blue(`    2.npm install`));
            console.log(chalk.blue(`    3.npm run dev`));
            console.log('\r\n');
            console.log(chalk.blue('------------------项目运行步骤说明end-----------------------'));
        });
    });
}

//判断文件夹是否存在处理逻辑
function slectActionBefore(name){
    if(!shelljs.test('-d',name)){//检测文件夹是否已存在
        //downloadTemplate(name);
        slectAction(name);
    }else{
        existName = name;
        backUpName = name+new Date().getTime();
        inquirer.prompt([{
            type:'list',
            name:'backupOrReplace',
            message:chalk.bgYellow.red(`${name}已存在，请选择处理方式？`),
            choices:[{
                value:'new',
                name:'重新输入项目名'
            },{
                value:'backup',
                name:'备份原项目再替换'
            },{
                value:'replace',
                name:'直接替换'
            }],
            default:0
        }]).then((replaceanswer)=>{
            switch(replaceanswer.backupOrReplace){
                case 'new'://修改文件名再下载模板
                    inquirer.prompt([{
                        type:'input',
                        name:'rename',
                        message:'请重新输入项目名：',
                        default:name,
                        validate:function(val){
                            if(val.trim() === ''){
                            return '项目名不能为空！';
                            }
                            return true;
                        }
                    }]).then(renameanswer=>{
                        slectActionBefore(renameanswer.rename);
                    })
                    break;
                case 'backup'://先备份再下载模板
                    shelljs.mv('-n',existName,backUpName+'/');
                    console.log(`${existName}项目会备份至${backUpName}文件夹下`);
                    slectAction(existName);
                    break;
                case 'replace'://直接替换原项目
                    slectAction(existName);
                    break;
                default:
                    break;
            }
        })
    }
}

//用户选择模板选项逻辑
function slectAction(name){
    inquirer.prompt([{
        type:'list',
        name:'jsmodule',
        message:chalk.red.bgYellow('你使用的模块化开发方式?'),
        choices:[{
            value:'amd',
            name:'使用(AMD)requirejs管理'
        },{
            value:'commonjs',
            name:'使用(Commonjs)webpack管理'
        },{
            value:'es6',
            name:'使用es6 Module'
        }],
        default:0
    },{
        type:'list',
        name:'cssmodule',
        message:chalk.red.bgYellow('你使用的CSS预处理器？'),
        choices:[{
            value:'less',
            name:'使用less预处理器管理CSS'
        },{
            value:'sass',
            name:'使用sass预处理器管理CSS'
        }],
        default:0
    },{
        type:'list',
        name:'version',
        message:chalk.red.bgYellow('你使用的文件版本管理方式？'),
        choices:[{
            value:'vmd5',
            name:'example.js?v=md5码,加hash值版本管理方式'
        },{
            value:'rename',
            name:'example.md5码.js,修改文件名的版本管理方式'
        }],
        default:0
    }]).then(answers => {
        downloadTemplate(name,answers);
    })
}