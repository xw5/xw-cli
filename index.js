#! /usr/bin/env node
const commander = require('commander');//命令行库
const shelljs = require('shelljs');//linux工具包
const chalk = require('chalk');//命令行样式
const inquirer = require('inquirer');//命令行选择库
const ora = require('ora');//命令行loading效果
const download = require('download-git-repo');//下载库
//const downloadSuper = require('github-download-parts');//下载库，支持下载项目下的文件夹
const figlet = require('figlet');//输出特殊字符

let isReplace = false;
let existName = '';//重复的工程名
let backUpName = '';//备份的工程名

//设置版本号
commander.version('v1.1.7','-v,--version');

//新增option --name后面的[val]]当前这个选项的参数值 []可选<>必填
//如果第三个参数为一个函数，会接受来处用户的值并返回一个值做为实际的值
//commander.option('-n,--name [name]','设置名称',val => val.toLowerCase(),'zmouse');
commander.option('-s,--separate','使用前后端分离版本');

//添加子命令
let createCommnader = commander.command('create <project-name>');

createCommnader.description(chalk.blue('创建开发项目'));
createCommnader.action((projectName)=>{
    slectActionBefore(projectName);
});

//解析来自process.argv上的数据
commander.parse(process.argv);

//如果有name值就输出
// if(commander.name){
//     console.log(commander.name);
//     shelljs.sed('-i','sass',commander.name,'test.js');
//     shelljs.mv('test0.js','test.js');
// }
//{ jsmodule: 'requirejs', cssmodule: 'less', version: 'vmd5' }

//下载模板逻辑
function downloadTemplate(dir,answers,gitName){
    const loadingCli = ora(chalk.gray(`Loading ${dir},请稍等...\r\n`)).start();
    let config = {
        html:answers.config.indexOf('include') != -1 ? true : false,
        rem:answers.config.indexOf('rem') != -1 ? true : false,
        sprite:answers.config.indexOf('sprite') != -1 ? true : false
    };
    download('github:xw5/'+gitName,dir+'/',(err)=>{
        if(err){
            console.log('网络繁忙，请稍后再试！');
            return;
        }
        //删除git配置
        shelljs.rm(dir+'/.gitignore');
        if(commander.separate){
            //css解析方式处理
            if(answers.cssmodule === 'less'){
                shelljs.rm('-rf',dir+'/src/sass');
            }else{
                shelljs.rm('-rf',dir+'/src/less');
                writeConfig('less','sass',dir);
            };
            //js模块化开发方式配置
            switch(answers.jsmodule){
                case 'requirejs':
                    shelljs.mv(dir+'/src/js-require',dir+'/src/js');
                    shelljs.rm('-rf',dir+'/src/js-es6');
                    shelljs.rm('-rf',dir+'/src/js-webpack');
                    shelljs.rm(dir+'/package.es6.json');
                    shelljs.rm(dir+'/webpack.config.es6.js');
                    shelljs.rm(dir+'/src/index.es6.webpack.html');
                    shelljs.rm(dir+'/src/index.es6.webpack.template.html');
                    if(answers.template){//html模块化功能配置
                        shelljs.mv(dir+'/src/index.require.template.html',dir+'/src/index.html');
                        shelljs.rm(dir+'/src/index.require.html');
                    }else{
                        shelljs.mv(dir+'/src/index.require.html',dir+'/src/index.html');
                        shelljs.rm(dir+'/src/index.require.template.html');
                        writeConfig('template:true','template:false',dir);
                        shelljs.rm('-rf',dir+'/src/template');
                    };
                    break;
                case 'webpack':
                    shelljs.mv(dir+'/src/js-webpack',dir+'/src/js');
                    shelljs.rm('-rf',dir+'/src/js-require');
                    shelljs.rm('-rf',dir+'/src/js-es6');
                    shelljs.rm(dir+'/package.es6.json');
                    shelljs.rm(dir+'/webpack.config.es6.js');
                    shelljs.rm(dir+'/src/index.require.html');
                    shelljs.rm(dir+'/src/index.require.template.html');
                    if(answers.template){//html模块化功能配置
                        shelljs.mv(dir+'/src/index.es6.webpack.template.html',dir+'/src/index.html');
                        shelljs.rm(dir+'/src/index.es6.webpack.html');
                    }else{
                        shelljs.mv(dir+'/src/index.es6.webpack.html',dir+'/src/index.html');
                        shelljs.rm(dir+'/src/index.es6.webpack.template.html');
                        writeConfig('template:true','template:false',dir);
                        shelljs.rm('-rf',dir+'/src/template');
                    };
                    writeConfig('requirejs','webpack',dir);
                    break;
                case 'es6':
                    shelljs.mv(dir+'/src/js-es6',dir+'/src/js');
                    shelljs.rm('-rf',dir+'/src/js-require');
                    shelljs.rm('-rf',dir+'/src/js-webpack');
                    shelljs.mv(dir+'/package.es6.json',dir+'/package.json');
                    shelljs.mv(dir+'/webpack.config.es6.js',dir+'/webpack.config.js');
                    shelljs.rm(dir+'/src/index.require.html');
                    shelljs.rm(dir+'/src/index.require.template.html');
                    if(answers.template){//html模块化功能配置
                        shelljs.mv(dir+'/src/index.es6.webpack.template.html',dir+'/src/index.html');
                        shelljs.rm(dir+'/src/index.es6.webpack.html');
                    }else{
                        shelljs.mv(dir+'/src/index.es6.webpack.html',dir+'/src/index.html');
                        shelljs.rm(dir+'/src/index.es6.webpack.template.html');
                        writeConfig('template:true','template:false',dir);
                        shelljs.rm('-rf',dir+'/src/template');
                    }
                    writeConfig('requirejs','webpack',dir);
                    break;
            };
            //根据选择不同的版本号切换配置文件
            if(answers.version === 'rename'){
                writeConfig('vmd5','rename',dir);
            };
        }else{//通用模板逻辑处理
            if(config.html){//如果需要HTML模块化
                shelljs.mv(dir+'/src/index.template.html',dir+'/src/index.html');
                writeConfig('template:false','template:true',dir);
            }else{//如果不需要HTML模块化
                shelljs.rm('-rf',dir+'/src/template');
                shelljs.rm('-rf',dir+'/src/index.template.html');
            }
            writeConfig('wx_mix',dir,dir);
        }
        //集成功能选择
        if(!config.sprite){//不需要雪碧图生成功能
            writeConfig('sprite:true','sprite:false',dir);
        }
        if(config.rem){//需要支持rem
            writeConfig('rem:false','rem:true',dir);
        }else{
            writeHtml(/<\!-- rem s-->.{1,}<\!-- rem e-->/,'',dir);
        }
        //项目提示
        figlet('XW-CLI', function(err,data){
            if(!err){
                console.log(chalk.green(data));
            };
            loadingCli.clear();
            console.log('\r\n');
            loadingCli.succeed(chalk.green(`${dir}项目模板已下载成功！`));
            console.log(chalk.blue('------------------项目运行步骤说明start---------------------'));
            console.log('\r\n');
            console.log(chalk.blue(`    cd ${dir}`));
            console.log(chalk.blue(`    npm install //安装项目模块`));
            !commander.separate && console.log(chalk.blue(`    npm run static //走静态开发模式`));
            console.log(chalk.blue(`    npm run dev //走${!commander.separate ? '混合' : ''}开发流程`));
            console.log(chalk.blue(`    npm run build //走构建流程`));
            console.log('\r\n');
            console.log(chalk.blue('------------------项目运行步骤说明end-----------------------'));
        });
    });
}

//修改配置文件相关配置参数
function writeConfig(oldStr,newStr,dir){
    shelljs.sed('-i',oldStr,newStr,dir+'/config/config.js');
}
//修改html文件
function writeHtml(oldStr,newStr,dir){
    shelljs.sed('-i',oldStr,newStr,dir+'/src/index.html');
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
                    isReplace = true;
                    slectAction(existName);
                    break;
                default:
                    break;
            }
        })
    }
}

//下载封装
function downloadPro(name,answers,proName){
    if(isReplace){
        shelljs.rm('-rf',existName);
    }
    downloadTemplate(name,answers,proName);
}

//用户选择模板选项逻辑
function slectAction(name){
    //前后端分离模式才走这
    if(commander.separate){
        inquirer.prompt([{
            type:'list',
            name:'jsmodule',
            message:chalk.red.bgYellow('你使用的模块化开发方式?'),
            choices:[{
                value:'requirejs',
                name:'使用(AMD)requirejs管理'
            },{
                value:'webpack',
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
                value:'scss',
                name:'使用sass预处理器管理CSS'
            }],
            default:0
        },{
            type:'checkbox',
            name:'config',
            message:chalk.red.bgYellow('请选择你需要集成的功能'),
            choices:[
                {
                    value:'include',
                    name:'html模块化'
                },{
                    value:'rem',
                    name:'集成px转rem功能'
                },{
                    value:'sprite',
                    checked:true,
                    name:'集成雪碧图合并功能'
                }
            ]
        },{
            type:'list',
            name:'version',
            message:chalk.red.bgYellow('你使用的文件版本管理方式？'),
            choices:[{
                value:'vmd5',
                name:'example.js?v=md5码,加search值版本管理方式'
            },{
                value:'rename',
                name:'example.md5码.js,修改文件名的版本管理方式'
            }],
            default:0
        }]).then(answers => {
            // if(isReplace){
            //     shelljs.rm('-rf',existName);
            // }
            // downloadTemplate(name,answers,'wps-cli-dir');
            downloadPro(name,answers,'wps-cli-dir');
        });
    }else{
        inquirer.prompt([
            // {
            //     type:'confirm',
            //     name:'template',
            //     message:chalk.red.bgYellow('是否需要HTML模块化功能'),
            //     default:false
            // }
            {
                type:'checkbox',
                name:'config',
                message:chalk.red.bgYellow('请选择你需要集成的功能'),
                choices:[
                    {
                        value:'include',
                        name:'html模块化'
                    },{
                        value:'rem',
                        name:'集成px转rem功能'
                    },{
                        value:'sprite',
                        checked:true,
                        name:'集成雪碧图合并功能'
                    }
                ]
            }
        ]).then(answers => {
            downloadPro(name,answers,'wps_mix');
        });
    }
}