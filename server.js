const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

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
getEmployees = () => {
    db.query(
        'SELECT * FROM `employee`',
        function(err, results) {
            console.table(results.firstName); // results contains rows returned by server
            // const employeeList = [];
            return employeeList;
        }
    );    
}

getEmployees(); 

const employeeList = [];
const departmentList = [];
const roleList = [];

// Prompt User for Input
getInput = () => {
    inquirer.prompt({
        type: 'list',
        choices: ['View all employees', 'Add employee', 'Update employee role', 'View all roles', 'Add role', 'View all departments', 'Add department', 'Quit'],
        name: 'option',
        message: 'What would you like to do?'
    })
    .then((response) => {
        // console.log(response.option);
        if (response.option == 'Add employee') {
            addEmployee();
        } else if (response.option == 'View all employees') {
            viewEmployees();
        } else if (response.option == 'Update employee role') {
            updateRole();
        } else if (response.option == 'View all roles') {
            viewRoles();
        } else if (response.option == 'Add role') {
            addRole();
        } else if (response.option == 'View all departments') {
            viewDepartments();
        } else if (response.option == 'Add department') {
            addDepartment();
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

// function that runs when view all employees is selected
viewEmployees = () => {
    db.query(
        'SELECT * FROM `employee`',
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
            // get from list of current employees
            choices: employeeList,
            name: 'manager',
            message: 'Manager: '
        },
    ])

    .then((response => {
        db.query(
            `INSERT INTO employee (first_name, last_name, manager_id) VALUES ('${response.firstName}', '${response.lastName}', '${response.manager}')`, 
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
        db.query(
            `UPDATE employee SET role_id = '${response.newRole}' [WHERE id = '${response.employeeToUpdate}']`, 
            function(err, results) {
                if (err) console.error(err);
                console.log('Employee updated'); 
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
        'SELECT * FROM `role`',
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
            `INSERT INTO role (title, salary, department_id) VALUES ('${response.roleTitle}', '${response.roleDepartment}', '${response.roleSalary}')`, 
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
