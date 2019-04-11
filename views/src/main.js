/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-undef */


$(function () {

    var ejs = require('ejs');
    var fs = require('fs');
    
    var pizza_ejs = fs.readFileSync('views/common/pizza_template.ejs', "utf8");
    var order_ejs = fs.readFileSync('views/common/order_template.ejs', "utf8");

    var pizza_arr = {};
    var pizza_filled = false;
    
    var money = 0;
    var orders_amount = 0;

    if (localStorage["pizza_arr"]) {
        pizza_arr = JSON.parse(localStorage["pizza_arr"]);
        pizza_filled = true;
        $('.right-middle-block').html(localStorage["right_html"]);
        orders_amount = Number(localStorage['orders_amount']);
        $('.orders').text(orders_amount);
        money = Number(localStorage['money']);
        $('.money').text(money);
        update_click();
    }

    function save_all(){
        localStorage['pizza_arr'] = JSON.stringify(pizza_arr);
        localStorage['right_html'] =  $('.right-middle-block').html();
        localStorage['orders_amount'] = String(orders_amount);
        localStorage['money'] = String(money);
    }

    $('.del_all').click(function(){
        $('.right-middle-block').text('');
        money = 0;
        orders_amount = 0;
        $('.money').text(money);
        $('.orders').text(orders_amount);
        for(var k in pizza_arr) {
            pizza_arr[k].big.amount = 0;
            pizza_arr[k].small.amount = 0;
         }
        save_all();
    });

    function update_click(){

        $('.element-plus').off('click');
        $('.element-plus').click(function(){
            var element = $(this).closest('.element');
            var id_name = element.attr('id');
            var element_id = id_name.split('-')[0];
            var element_type = id_name.split('-')[1];
            pizza = pizza_arr[element_id];
            if (element_type == 'big')
                $('.right-middle-block').find('#' + id_name).find('.element-amount').text(++pizza.big.amount);
            else
                $('.right-middle-block').find('#' + id_name).find('.element-amount').text(++pizza.small.amount);
            var price = Number(element.find('.price').text());
            money += price;
            $('.money').text(money);
            save_all();
        });

        $('.element-minus').off('click');
        $('.element-minus').click(function(){
            var element = $(this).closest('.element');
            var id_name = element.attr('id');
            var element_id = id_name.split('-')[0];
            var element_type = id_name.split('-')[1];
            pizza = pizza_arr[element_id];
            if (element_type == 'big'){
                if (pizza.big.amount < 2)
                     return;
                $('.right-middle-block').find('#' + id_name).find('.element-amount').text(--pizza.big.amount);
            }else{
                if (pizza.small.amount < 2)
                     return;
                $('.right-middle-block').find('#' + id_name).find('.element-amount').text(--pizza.small.amount);
            }
            var price = Number(element.find('.price').text());
            money -= price;
            $('.money').text(money);
            save_all();
        });

        $('.element-delete').off('click');
        $('.element-delete').click(function(){
            var element = $(this).closest('.element');
            var id_name = element.attr('id');
            var element_id = id_name.split('-')[0];
            var element_type = id_name.split('-')[1];
            pizza = pizza_arr[element_id];
            var price = Number(element.find('.price').text());
            if (element_type == 'big'){
                money -= price * pizza.big.amount;
                pizza.big.amount = 0;
            }else{
                money -= price * pizza.small.amount;
                pizza.small.amount = 0;
            }
            $('.money').text(money);
            element.remove();

            orders_amount--;
            $('.orders').text(orders_amount);
            save_all();
        });
    }

    function process_buy_button(size_name, pizza, id_name, price){
        pizza.amount++;
        if (pizza.amount == 1)
        {
            var order_html = ejs.render(order_ejs, {pizza: pizza.pizza_json, order: size_name });
            var order_clone = $(order_html);
            $('.right-middle-block').append(order_clone);
        }
        else{
            $('.right-middle-block').find(id_name).find('.element-amount').text(pizza.amount);
        }
        money += price;
        $('.money').text(money);
        update_click();
        orders_amount++;
        $('.orders').text(orders_amount);
        save_all();
    }

    function add_pizzas(pizzas){
        $('.pizza_count').text(pizzas.length);
        pizzas.forEach(pizza => {
            if (pizza_filled == false){
                pizza_arr[pizza.id] ={
                    big :{
                        amount: 0,
                        pizza_json: pizza
                    },
                    small:{
                        amount: 0,
                        pizza_json: pizza
                    }
                };
            }
            var pizza_html = ejs.render(pizza_ejs, {pizza: pizza});
            var pizza_clone = $(pizza_html);
            $('.pizza_list').append(pizza_clone);
        }); 
        pizza_filled = true;

        $('.button-big').click(function(){
            pizza_id = $(this).closest('.card').attr('id');
            pizza = pizza_arr[pizza_id];
            process_buy_button(" (Велика)", pizza.big, '#' + String(pizza_id) + '-big', pizza.big.pizza_json.big_size.price);
        });
        $('.button-small').click(function(){
            pizza_id = $(this).closest('.card').attr('id');
            pizza = pizza_arr[pizza_id];
            process_buy_button(" (Мала)", pizza.small, '#' + String(pizza_id) + '-small', pizza.small.pizza_json.small_size.price);
        });
        save_all();
    }

    function filter_pizzas(pizza_list, button_name){
        if (button_name == "Усі")
        {
            add_pizzas(pizza_list);
        } else if (button_name == "Мясні"){
            add_pizzas(pizza_list.filter(function(pizza){
                return pizza.type == 'М’ясна піца';
            }));
        } else if (button_name == "З ананасами"){
            add_pizzas(pizza_list.filter(function(pizza){
                return pizza.content.pineapple;
            }));
        } else if (button_name == "З грибами"){
            add_pizzas(pizza_list.filter(function(pizza){
                return pizza.content.mushroom;
            }));
        } else if (button_name == "З морепродуктами"){
            add_pizzas(pizza_list.filter(function(pizza){
                return pizza.type == 'Морська піца';
            }));
        } else if (button_name == "Вега"){
            add_pizzas(pizza_list.filter(function(pizza){
                return pizza.type == 'Вега піца';
            }));
        }
    }

    function add_filter_pizzas(button_name){
        $.ajax({
            url:	"http://localhost:300/get_pizza_list/",
            type:	'GET',
            success:	function(data){
                filter_pizzas(data, button_name);
            },
            fail:	function()	{
                // eslint-disable-next-line no-console
                console.log('error');
            }
        });
    }


    $('.filter-button').click(function(){
        $('.filter-active').removeClass("filter-active");
        $(this).addClass("filter-active");
        $('.pizza_list').html('');
        button_name = $(this).text();
        add_filter_pizzas(button_name);
    });


    add_filter_pizzas("Усі");

});