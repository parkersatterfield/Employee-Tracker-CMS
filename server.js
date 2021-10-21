const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const { response } = require('express');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root1234',
    database: 'employees_db'
});

// Data Arrays
const employeeList = [];
const departmentList = [];
const roleList = [];

getEmployees = () => {
    db.query(
        'SELECT first_name, last_name FROM `employee`',
        function(err, results) {
            for(let i =0; i< results.length; i++) {
                const { first_name, last_name } = results[i];
                const fullName = first_name +' '+ last_name;
                employeeList.push(fullName);
            }
            // console.log(employeeList);
            return employeeList;
        }
    )
}

getEmployees();

getRoles = () => {
    db.query(
        'SELECT title FROM `role`',
        function(err, results) {
            for(let i =0; i< results.length; i++) {
                const role  = results[i].title;
                roleList.push(role);
            }
            // console.log(roleList);
            return roleList;
        }
    )
}

getRoles();

getDepartments = () => {
    db.query(
        'SELECT name FROM `department`',
        function(err, results) {
            for(let i =0; i< results.length; i++) {
                const department = results[i].name;
                departmentList.push(department);
            }
            // console.log(departmentList);
            return departmentList;
        }
    )
}

getDepartments();

// Prompt User for Input
getInput = () => {
    inquirer.prompt({
        type: 'list',
        choices: ['View all employees', 'Add employee', 'Update employee role', 'View all roles', 'Add role', 'View all departments', 'Add department'],
        name: 'option',
        message: 'What would you like to do?'
    })
    .then((response) => {
        // console.log(response.option);
        if (response.option == 'Add employee') {
            addEmployee();
            getEmployees();
        } else if (response.option == 'View all employees') {
            viewEmployees();
        } else if (response.option == 'Update employee role') {
            updateRole();
            getEmployees();
        } else if (response.option == 'View all roles') {
            viewRoles();
        } else if (response.option == 'Add role') {
            addRole();
            getRoles();
        } else if (response.option == 'View all departments') {
            viewDepartments();
        } else if (response.option == 'Add department') {
            addDepartment();
            getDepartments();
        } else {
            console.log('Select an option')
        }
    })
    .catch((error) => {
        console.error(error);
    });
}; 

// Run function to initialize app
getInput();
//'SELECT * FROM `employee` LEFT JOIN role ON role.id = employee.role_id',

// function that runs when view all employees is selected
viewEmployees = () => {
    db.query(
        `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, employee.manager_id, department.name FROM employee, role, department WHERE employee.role_id = role.id AND department.id = role.department_id ORDER BY employee.id`,
        function(err, results) {
            console.log('\n');
            console.table(results); // results contains rows returned by server
        }
    );
    getInput();
};

// function that runs when add employee is selected
addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Employee first name:'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Employee last name: '
        },
        {
            type: 'list',
            choices: roleList,
            name: 'employeeRole',
            message: 'Employee role: '
        },
        {
            type: 'list',
            choices: employeeList,
            name: 'manager',
            message: 'Manager: '
        },
    ])

    .then((response => {
        // parse manager response into first and last names
        const manFirstName = response.manager.split(' ')[0];
        const manLastName = response.manager.split(' ')[1];
        db.query(
            `SELECT id FROM employee WHERE first_name = '${manFirstName}' AND last_name = '${manLastName}'`,
            function(err, results) {
                if (err) console.error(err);
                const manID = results[0].id;
                db.query(
                    `SELECT id FROM role WHERE title = '${response.employeeRole}'`,
                    function(err, results) {
                        if (err) console.error(err);
                        const connectorID = results[0].id;
                        console.log(connectorID);
                        db.query(
                            `INSERT INTO employee (first_name, last_name, manager_id, role_id) VALUES ('${response.firstName}', '${response.lastName}', '${manID}', '${connectorID}')`, 
                            function(err, results) {
                                if (err) console.error(err);
                                console.log('Employee added'); 
                            }
                        )
                    }
                )
            }
        )
    }))

    .then((response => {
        getInput();
    }))
};

// function that runs when update an employees role is selected
updateRole = () => {
    inquirer.prompt([
        {
            type: 'list',
            choices: employeeList,
            name: 'employeeToUpdate',
            message: 'Pick employee: '
        },
        {
            type: 'list',
            choices: roleList,
            name: 'newRole',
            message: 'New role: '
        }
    ])

    .then((response => {
        // get role title from role table, use role id to update employee by name
        name = response.employeeToUpdate.split(' ');
        const first_name = name[0];
        const last_name = name[1];
        const newRole = response.newRole;

        // find role id from role table by role title
        db.query(
            `SELECT id FROM role WHERE title = '${newRole}'`,
            function(err, results) {
                if (err) console.error(err);
                const roleID = results[0].id
                // update employee's role id in employee table
                db.query(
                    `UPDATE employee SET role_id = ${roleID} WHERE first_name = '${first_name}' AND last_name = '${last_name}'`, 
                    function(err, results) {
                        if (err) console.error(err);
                        console.log('Employee role updated'); 
                    }
                )
            }
        )
    }))

    .then((response => {
        getInput();
    }))
};

// function that runs when view all roles is selected
viewRoles = () => {
    db.query(
        // JOIN causes role id to change to department id???
        'SELECT role.id, role.title, department.name, role.salary FROM role, department WHERE department.id = role.department_id',
        function(err, results) {
            console.log('\n');
            console.table(results); // results contains rows returned by server
        }
    );
    getInput();
};

// function that runs when add a role is selected
addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'roleTitle',
            message: 'Role title:'
        },
        {
            type: 'list',
            //from department list
            choices: departmentList,
            name: 'roleDepartment',
            message: 'Role department: '
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'Role salary: '
        },
    ])

    .then((response => {
        db.query(
            `SELECT id FROM department WHERE name = '${response.roleDepartment}'`,
            function(err, results) {
                if (err) console.log(err);
                const connectorID = results[0].id;
                db.query(
                    `INSERT INTO role (title, salary, department_id) VALUES ('${response.roleTitle}', ${response.roleSalary}, ${connectorID})`, 
                    function(err, results) {
                        if (err) console.error(err);
                        console.log('Employee added'); 
                    }
                )
            }
        )
        
        
    }))

    .then((response => {
        getInput();
    }))
};

// function that runs when view all departments is selected
viewDepartments = () => {
    db.query(
        'SELECT * FROM `department`',
        function(err, results) {
            console.log('\n');
            console.table(results); // results contains rows returned by server
        }
    );
    getInput();
};

// function that runs when add a department is selected
addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'Department name: '
        },
        {
            type: 'input',
            name: 'departmentID',
            message: 'Department ID: '
        }
    ])

    .then((response => {
        db.query(
            `INSERT INTO department (name, id) VALUES ('${response.departmentName}', '${response.departmentID}')`, 
            function(err, results) {
                if (err) console.error(err);
                console.log('Employee added'); 
            }
        )
    }))

    .then((response => {
        getInput();
    }))
};

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
