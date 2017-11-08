// NPM Packages
// -----------------------------------------------------------------------------

var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

// Database connection
// -----------------------------------------------------------------------------

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "",
  database: "bamazon_DB"
});

connection.connect(function(err) {
  if (err) throw err;
  bamazon();
});

// Creating a new table using CLI NPM package
// -----------------------------------------------------------------------------

function bamazon() {
  connection.query("SELECT * FROM products", function(err, res) {
    var table = new Table({
      head: ['Item Id#', 'Product Name', 'Price/Quantity, ($)', 'Stock Quantity'],
      style: {
        head: ['red'],
        compact: false,
      }
    });
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].id, res[i].product_name, res[i].price, res[i].stock_quantity]);
    }
    console.log(table.toString());
    list();
  });

}

// Asking the user to choose an item ID and qunatity
// -----------------------------------------------------------------------------

function list() {
  inquirer.prompt([{
      type: 'input',
      name: 'item',
      message: 'Please enter the Item ID which you would like to purchase.',
    },
    {
      type: 'input',
      name: 'quantity',
      message: 'How many units do you need?',
    }
    // Using the users input to calculate the qunatity and the total cose
    // -------------------------------------------------------------------------

  ]).then(function(answers) {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) {
        console.log("Error");
      } else {
        if (res[answers.item - 1].stock_quantity < answers.quantity) {
          console.log("Insufficient quantity!");
          list();
        } else {
          var theId = answers.item;
          var value = (res[answers.item - 1].stock_quantity) - answers.quantity;
          console.log("Total cost: " + "$" + (res[answers.item - 1].price * answers.quantity));
          updateProduct(theId, value);
        }
      }
    });


  });
}

// Updates the database with the updated information
// -----------------------------------------------------------------------------

function updateProduct(theId, value) {
  connection.query(
    "UPDATE products SET stock_quantity = ? WHERE id = ?", [
      value, theId
    ],
    function(err, res) {
      if (err) throw err;
      console.log("Updated Quantity In Stock: " + value);


    }
  );

}
