var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazonDB"
});


var showProducts = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) {
            console.log(err)
        }
        for (var i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id + " | " + "Product: " + res[i].product_name + " | " + "Department: " + res[i].department_name + " | " + "Price: $" + res[i].price + " | " + "Stock: " + res[i].stock_quantity)
        }
        console.log('\n')
        promptAction();
    });
} //end showProducts

var showProductsOrder = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        console.log("\n")
        if (err) {
            console.log(err)
        }
        for (var i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id + " | " + "Product: " + res[i].product_name + " | " + "Department: " + res[i].department_name + " | " + "Price: $" + res[i].price + " | " + "Stock: " + res[i].stock_quantity)
        }
        inquirer.prompt([{
            name: "id",
            type: 'input',
            message: "Select product ID.",
            validate: function (value) {
                if (!isNaN(value) && value.length > 0) {
                    return true;
                } else {
                    return false;
                }
            }
    
        },
        {
            name: "quantity",
            type: 'input',
            message: "Select the amount of the item you'd like to order.",
            validate: function (value) {
                if (!isNaN(value) && value.length > 0) {
                    return true;
                } else {
                    return false;
                }
            }
    
        }
        ]).then(function (response) {
            var quantity = parseInt(response.quantity);
            var item = parseInt(response.id)
            connection.query("SELECT * FROM products WHERE ?",
                [
                    {
                        item_id: item
                    }
                ], function (err, res) {
                    if (err) {
                        console.log(err)
                    }
                    if (res.length === 0) {
                        console.log("Unrecognized item ID.")
                        console.log("----------------------------------------")
                        orderStock()
                    } else {
    
                        var currentProduct = res[0];
    
                        console.log("Placing your order!")
    
                        var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (currentProduct.stock_quantity + quantity) + ' WHERE item_id = ' + item;
    
                        connection.query(updateQueryStr, function (err, res) {
                            if (err) {
                                console.log(err)
                            }
                            console.log("Your order has been placed. Have a great day!")
                        });
        
                    }
                    promptAction();
                  })
                });
            
    });
} //end showProductsNoPrompt


var addItem = function () {

        inquirer.prompt([
        {
            name: "name",
            type: 'input',
            message: "What item would you like to add?"    
        },
        {
            name: "price",
            type: 'input',
            message: "How much does it cost?",
            validate: function (value) {
                if (!isNaN(value) && value.length > 0) {
                    return true;
                } else {
                    return false;
                }
            }
    
        },
        {
            name: "stock",
            type: 'input',
            message: "How much do we have in stock?",
            validate: function (value) {
                if (!isNaN(value) && value.length > 0) {
                    return true;
                } else {
                    return false;
                }
            }

        },
        {
            name: "department",
            type: 'list',
            message: "Which department is it in?",
            choices: ["Toys","Home","Electronics"]

        }
        ]).then(function(response){

            var addQueryStr = "INSERT INTO products SET ?"

            connection.query(addQueryStr,[
                {product_name: response.name,
                department_name: response.department,
                price: response.price,
                stock_quantity: response.stock}
                ],function(err){
                if(err){
                    console.log(err)
                }
                promptAction()
            });
        });
    }

    


var orderStock = function () {
    showProductsOrder()
    
    
    }//end orderStock

  var promptAction = function () {

        inquirer.prompt([{
            name: 'action',
            type: "list",
            choices: ["See Inventory", "Order Stock", "Add Item", "Exit"],
            message: "Hello Manager. What would you like to do Today?"
        }
        ]).then(function (response) {

            switch (response.action) {
                case "See Inventory":
                    showProducts();
                    break;

                case "Order Stock":
                    orderStock();
                    break;

                case "Add Item":
                    addItem();
                    break;

                case "Exit":
                    console.log("Thank you for your hard work.")
                    connection.end();
            }
        });
    }//end promptAction

    promptAction()