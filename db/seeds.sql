INSERT INTO department (name, id)
VALUES ('Accounting', 002),
       ('Engineering', 001),
       ('Management', 003),
       ('Sales', 004);

INSERT INTO role (title, salary, department_id)
VALUES ('Jr Engineer', 80000, 001),
       ('Sr Engineer', 100000, 001),
       ('Controller', 100000, 002),
       ('Project Manager', 120000, 003),
       ('Vice President', 200000, 003),
       ('Sales Lead', 90000, 004),
       ('Jr Salesman', 60000, 004);

INSERT INTO employee (first_name, last_name, manager_id)
VALUES ('John', 'Smith', 001),
       ('Ella', 'Louise', 002),
       ('Suzanne', 'Schaffer', 002),
       ('Loren', 'Weaver', 003),
       ('Derrick', 'Henry', 004); 

