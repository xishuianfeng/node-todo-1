const db = require("./db.js")
const inquirer = require('inquirer')

module.exports.add = async (title) => {
  const list = await db.read()  //读取之前的任务
  list.push({ title, done: false })  //添加一个新任务
  db.write(list)  //存储任务到文件
}

module.exports.clear = async () => {
  await db.write([])
}


function markAsDone(list, index) {
  list[index].done = true
  db.write(list)
}
function markAsUndone(list, index) {
  list[index].done = false
  db.write(list)
}

function updateTitle(list, index) {
  inquirer.prompt({
    type: 'input',
    name: 'title',
    message: '新的标题',
  }).then(answer => {
    list[index].title = answer.title
    db.write(list)
  })
}
function remove(list, index) {
  list.splice(index, 1)
  db.write(list)
}


function askForAction(list, index) {
  const actions = { markAsDone, markAsUndone, remove, updateTitle }
  inquirer.prompt({
    type: 'list',
    name: 'action',
    message: '请选择操作',
    choices: [
      { name: '退出', value: 'quit' },
      { name: '完成', value: 'markAsDone' },
      { name: '未完成', value: 'markAsUndone' },
      { name: '删除', value: 'remove' },
      { name: '改名', value: 'updateTitle' },
    ]
  }).then(answer2 => {
    const action = actions[answer2.action]
    action && action(list, index)
  })
}

function askForCreateTask(list) {
  inquirer.prompt({
    type: 'input',
    name: 'title',
    message: '输入任务名',
  }).then(answer => {
    list.push({
      title: answer.title,
      done: false
    })
    db.write(list)
  })
}

function printTasks(list) {
  inquirer
    .prompt(
      {
        type: 'list',
        name: 'index',
        message: '请选择你已完成的任务',
        choices: [{ name: '退出', value: -1 }, ...list.map((task, index) => {
          return { name: `${task.done ? '[x]' : '[_]'} ${index + 1} - ${task.title}`, value: index };
        }), { name: '+ 创建任务', value: -2 }]
      })
    .then(answer => {
      const index = parseInt(answer.index)
      if (answer.index >= 0) {
        //选中一个任务
        askForAction(list, index)
      } else if (index === -2) {
        askForCreateTask(list)
        //创建任务
      }
    })
}

module.exports.showAll = async () => {
  const list = await db.read()
  printTasks(list)
}