(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-undef */

$(function () {
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
    }

    $('.element-minus').hide();
    $('.element-plus').hide();
    $('.element-delete').hide();
    $('.del_all').hide();
    $('.b').attr('href', '#');
    $('.amount-bar').append(' піца');


    var adress = $("#adress");
    var adressIsOk = true;
    var orderTime = $("#order-time");
    var orderAdress = $("#order-adress");

    initOrderPage();

    function initOrderPage() {
        if (document.getElementById("googleMap")) {
            google.maps.event.addDomListener(window, 'load', function () {
                var directionsDisplay = new google.maps.DirectionsRenderer();
                var directionService = new google.maps.DirectionsService();
                var geocoder = new google.maps.Geocoder();
                //Тут починаємо працювати з картою
                var mapProp = {
                    center: new google.maps.LatLng(50.464379, 30.519131),
                    zoom: 11
                };
                var html_element = document.getElementById("googleMap");
                var map = new google.maps.Map(html_element, mapProp);
                directionsDisplay.setMap(map);
                directionsDisplay.setOptions({ suppressMarkers: true });
                //Карта створена і показана
                var point = new google.maps.LatLng(50.464379, 30.519131);
                var homeMarker;
                var marker = new google.maps.Marker({
                    position: point,
                    map: map,  //map	- це змінна карти створена за допомогою new google.maps.Map(...)
                    icon: "assets/images/map-icon.png"
                });
                google.maps.event.addListener(map, 'click', function (me) {
                    createPath(me.latLng, true);
                });
                var run_id = false;
                adress.on("keyup", function () {
                    if (run_id)
                        clearTimeout(run_id);
                    run_id = false;
                    if (adressIsOk) {
                        orderAdress.text(adress.val());
                        run_id = setTimeout(function () {
                            geocodeAddress(adress.val(), function (err, coordinates) {
                                if (!err) {
                                    createPath(coordinates, false);
                                } else {
                                    cantFindAdress();
                                    //console.log(err);
                                }
                            });
                        }, 500);
                    } else {
                        cantFindAdress();
                        orderAdress.text("невідома");
                        orderTime.text("невідомий");
                    }
                });
                function createPath(coordinates, updateAdress) {
                    //console.log("coords:"+coordinates);
                    geocodeLatLng(coordinates, function (err, adress1) {
                        //console.log("adress:"+adress);
                        if (!err) {//Дізналися адресу
                            console.log(adress1);
                            if (updateAdress) {
                                adress.val("" + adress1);
                            }
                            if (!homeMarker) {
                                homeMarker = new google.maps.Marker({
                                    position: coordinates,
                                    map: map,
                                    icon: "assets/images/home-icon.png"
                                });
                            } else {
                                homeMarker.setMap(map);
                                homeMarker.setPosition(coordinates);
                            }
                            calculateRoute(point, coordinates, function (err, result) {
                                if (!err) {
                                    console.log(3);
                                    orderTime.text("" + result.duration.text);
                                    orderAdress.text(adress.val());
                                } else {
                                    cantFindAdress();
                                    //console.log(err);
                                }
                            });
                        } else {
                            cantFindAdress();
                            //console.log("Немає адреси\n"+err);
                        }
                    });
                }
                function cantFindAdress(err) {
                    directionsDisplay.setMap(null);
                    if (homeMarker)
                        homeMarker.setMap(null);
                    orderTime.text("невідомий");
                }
                function calculateRoute(A_latlng, B_latlng, callback) {
                    directionsDisplay.setMap(map);
                    directionService.route({
                        origin: A_latlng,
                        destination: B_latlng,
                        travelMode: google.maps.TravelMode["DRIVING"]
                    }, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(response);
                            var leg = response.routes[0].legs[0];
                            callback(null, {
                                duration: leg.duration
                            });
                        } else {
                            callback(new Error("Can'	not	find	direction"));
                        }
                    });
                }
                function geocodeLatLng(latlng, callback) {//Модуль за роботу з адресою
                    geocoder.geocode({ 'location': latlng }, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK && results[1]) {
                            var adress = results[1].formatted_address;
                            callback(null, adress);
                        } else {
                            callback(new Error("Can't	find	adress"));
                        }
                    });
                }
                function geocodeAddress(adress, callback) {
                    geocoder.geocode({ 'address': adress }, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK && results[0]) {
                            var coordinates = results[0].geometry.location;
                            callback(null, coordinates);
                        } else {
                            callback(new Error("Can	not	find	the	adress"));
                        }
                    });
                }
            });
        }
    }

    var pizza_id = ["1","2","3","4","17","43","90","6"];

    function get_pizza_list_from_ls(){
        var ret = [];
        pizza_id.forEach(id => {
            if (pizza_arr[id].small.amount > 0){
                ret.push({
                    id: id,
                    type: "small",
                    amount: pizza_arr[id].small.amount
                });
            }
            if (pizza_arr[id].big.amount > 0){
                ret.push({
                    id: id,
                    type: "big",
                    amount: pizza_arr[id].big.amount
                });
            }
        });
        return ret;
    }

    $("#confrim-order").click(event => {
        let ok = true;
        let name = $("#name").val();
        let phone = $('#phone').val();
        let adress = $("#adress").val();
        if (!name || !phone || !adress) {
            ok = false;
        }
        if (ok) {
            var ret_arr = get_pizza_list_from_ls();
            ret_arr.push({
                name: name,
                phone: phone,
                adress: adress
            });
            var data = JSON.stringify(ret_arr);
            $.ajax({
                method: "POST",
                url: "/newOrder",
                contentType :	'application/json',
                data: data,
                success: function (res) {
                    console.log(data);
                    localStorage["pizza_arr"] = '';
                    window.location.href = '/';
                }
            });
        } else {
            if (!name) {
                $("#name-error").show();
                $("#name").addClass("is-invalid");
            } else {
                $("#name-error").hide();
                $("#name").addClass("is-valid");
                $("#name").removeClass("is-invalid");
            }
            if (!phone) {
                $("#phone-error").show();
                $("#phone").addClass("is-invalid");
            } else {
                $("#phone-error").hide();
                $("#phone").addClass("is-valid");
                $("#phone").removeClass("is-invalid");
            }
            if (!adress) {
                $("#adress-error").show();
                $("#adress").addClass("is-invalid");
            } else {
                $("#adress-error").hide();
                $("#adress").addClass("is-valid");
                $("#adress").removeClass("is-invalid");
            }
        }
    });

});

},{}]},{},[1]);
