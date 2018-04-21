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


  var showProducts = function(){
    console.log("Welcome to Bamazon!")
      connection.query("SELECT * FROM products", function(err, res){
        if (err){
          console.log(err)
        }
        for(var i = 0; i<res.length; i++){
          console.log("ID: "+res[i].item_id+" | "+"Product: " + res[i].product_name+ " | " + "Department: " + res[i].department_name + " | " + "Price: $"+res[i].price+" | " + "Stock: "+res[i].stock_quantity)
        }
        
        buyItem();
      });

  } 
  
  
    

var buyItem = function(){
  inquirer.prompt([{
    name: "id",
    type: 'input',
    message:"Select the item ID of the item you'd like to purchase.",
    validate: function(value){
      if(!isNaN(value) && value.length>0){
        return true;
    } else {
        return false;
    }
    } 

  },
  {
    name: "quantity",
    type: 'input',
    message:"Select the amount of the item you'd like to purchase.",
    validate: function(value){
      if(!isNaN(value) && value.length>0){
        return true;
    } else {
        return false;
    }
    } 

  }
]).then(function(response){
  var quantity = response.quantity;
  var item = parseInt(response.id)
  connection.query("SELECT * FROM products WHERE ?",
  [
    {
      item_id: item 
    }
  ], function(err, res){
    if (err){
      console.log(err)
    }
    if (res.length === 0){
      console.log("Unrecognized item ID.")
      console.log("----------------------------------------")
      showProducts()
    } else {
      
      var currentProduct = res[0];
      if(quantity <= currentProduct.stock_quantity){
        console.log("Placing your order!")
        var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (currentProduct.stock_quantity - quantity) + ' WHERE item_id = ' + item;
        connection.query(updateQueryStr, function(err, res){
          if(err){
            console.log(err)
          }
          console.log("Your order has been placed. The sum total is: $"+currentProduct.price*quantity+". Have a great day!")
        });
        connection.end()
      } else{
        console.log("I'm sorry but we don't have that much in stock.")
        showProducts();
      }
    }
    
  });
})
};//end buyItem


showProducts()