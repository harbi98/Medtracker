import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
  TextInput,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { BASE_URL, processResponse } from "../../config";
import { AuthContext } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import SyncStorage from "sync-storage";

export default function Medicines({ navigation }) {
  const [data, setData] = useState(null);
  const { userInfo } = useContext(AuthContext);
  const [itemsInCart, setItemsInCart] = useState(null);
  // const [addedItems, setAddedItems] = useState([]);
  // const [cartData, setCart] = useState();

  const getItems = () => {
    try {
      fetch(`${BASE_URL}product-list`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then(processResponse)
        .then((res) => {
          const { statusCode, data } = res;
          // console.log(data.result);
          setData(data.result);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const addToCart = (productId, price) => {
    try {
      fetch(`${BASE_URL}cart/add-cart`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          price: price,
          quantity: 1,
        }),
      })
        .then(processResponse)
        .then((res) => {
          const { statusCode, data } = res;
          alert(data.success);

          setItemsInCart((prevItems) => [...(prevItems || []), { product_id: productId }]);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const getCartsArray = async () => {
    try {
      await fetch(`${BASE_URL}cart/cart-item`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      })
        .then(processResponse)
        .then((res) => {
          const { statusCode, data } = res;
          let merchant_list = [];
          let cartsItems = [];
          if (statusCode === 200 && data.cart_items.length > 0) {
            data.cart_items.map((item) => {
              cartsItems.push(item);
            });
            setItemsInCart(data.cart_items);
          } else {
            setItemsInCart(null);
          }
        });
    } catch (e) {
      console.log(e);
    }
  };

  const isCartEmpty = !itemsInCart;

  useEffect(() => {
    if(itemsInCart !== null){
      itemsInCart.forEach((cart_item) => {
        data.forEach((data_item) => {
          if(data_item.id === cart_item.product_id){
            console.log(cart_item);
          }else{
            setItemsInCart(prevItems => prevItems.filter(item => item.product_id !== productId));
          }
        });
      });
    }else{
      console.log('empty');
    }
    
    getCartsArray();
    getItems();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar></StatusBar> */}
      <StatusBar hidden={false} translucent={true} />
      <View style={styles.upper_header}>
        <Text style={styles.upper_header_maintext}>
          Hello{" "}
          <Text style={{ fontWeight: "bold" }}>
            {userInfo.details.first_name},
          </Text>
        </Text>
        <Text style={styles.upper_header_subtexts}>Find Medicines</Text>
      </View>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 10, height: "100%" }}>
          <TextInput
            style={styles.text_input}
            placeholder="Search Medicine..."
          />
        </View>
        <TouchableOpacity
          underlayColor={"#fff"}
          activeOpacity={0.2}
          style={styles.menu_button}
          onPress={() => {console.log("pressed");

          }}
        >
          <Image
            source={require("../../../assets/search.png")}
            style={styles.menu_icon_right}
          />
        </TouchableOpacity>
      </View>
      <View style={{ width: "100%" }}>
        <LinearGradient
          colors={["transparent", "#D0E7D2"]}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
          }}
        />
        {data ? (
          <FlatList
            style={[styles.med_padding]}
            data={data}
            extraData={data}
            // numColumns={1}
            renderItem={({ item }) => {
              // console.log(item.id);

              return (
                <TouchableOpacity
                  underlayColor={"#87b5eb"}
                  style={[styles.inner_container]}
                  onPress={() =>
                    navigation.navigate("MedicineDetails", {
                      product_name: item,
                    })
                  }
                >
                  <>
                    {/* {item.photo ?
                                                    <Image source={{uri: item.photo}} style={{resizeMode: 'cover', width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10, height: 150}}/>
                                                :
                                                    <View style={{width: '100%', height: 150, backgroundColor: '#f2f2f2', borderTopLeftRadius: 10, borderTopRightRadius: 10}}/>
                                            } */}
                    <View
                      style={[styles.med_container, { flexDirection: "row" }]}
                    >
                      <View style={[styles.start_med_container]}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={styles.product_title}
                        >
                          {item.name}
                        </Text>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={styles.merchant_name}
                        >
                          {item.merchant_name}
                        </Text>
                        {item.is_prescription_required ? (
                          <FontAwesome5
                            name="prescription"
                            size={24}
                            color="#2dc4f4"
                            style={[{ marginLeft: "2%" }]}
                          />
                        ) : (
                          <FontAwesome5
                            name="prescription"
                            size={24}
                            color="#b2b2b2"
                            style={[{ marginLeft: "2%" }]}
                          />
                        )}
                      </View>
                      <View style={[styles.end_med_container]}>
                        <Text style={[{ fontWeight: "bold" }]}>
                          {"\u20B1"}
                          {item.price}
                        </Text>
                        <TouchableOpacity
                          underlayColor={"#fff"}
                          style={{
                            backgroundColor: "#6EB95B",
                            // flex: 1,
                            marginTop: 20,
                            // height: 50,
                            height: 30,
                            width: 110,
                            borderRadius: 100,
                            alignItems: "center",
                            justifyContent: "center",
                            paddingBottom: 2,
                          }}
                          onPress={() => {
                            addToCart(item.id, item.price);
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "bold" }}>
                            {/* {addedItems.includes(item.id) ? 'Added to cart' : 'Add to cart'} */}
                            {/* {itemsInCart.some(val => item.id === val.product_id) ? 'Added to cart' : 'Add to cart'} */}
                            {itemsInCart === null ? "Add to cart" : (itemsInCart.some((val) => item.id === val.product_id) ? "Added to cart" : "Add to cart")}
                          </Text>
                          {/* <Image source={require('../../../assets/shopping-cart-add.png')} style={{resizeMode: 'contain', width: '100%', height: '100%'}}/> */}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                </TouchableOpacity>
              );
            }}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  inner_container: {
    // flex: 1,
    height: 100,
    // justifyContent: 'center',
    // alignItems: 'center',
    alignSelf: "center",
    width: "94%",
    backgroundColor: "#fff",
    marginBottom: 10,
    elevation: 5,
    borderRadius: 10,
    // paddingTop: 500,
  },
  med_padding: {
    marginVertical: 2,
    marginBottom: "48%",
    // alignItems: 'center'
    // marginLeft: 40
  },
  med_container: {
    padding: 15,
    flex: 1,
    // backgroundColor: 'red',
  },
  start_med_container: {
    // backgroundColor: 'red',
    flexDirection: "column",
    flex: 1,
  },
  end_med_container: {
    alignItems: "flex-end",
    width: 100,
    // backgroundColor: 'blue',
  },
  upper_header: {
    backgroundColor: "#6EB95B",
    paddingHorizontal: 20,
    paddingTop: "10%",
    paddingBottom: "5%",
    elevation: 5,
    shadowOffset: { width: 0, height: 100 },
    shadowOpacity: 5,
    shadowRadius: 50,
  },
  upper_header_maintext: {
    marginTop: 10,
    fontSize: 20,
    color: "white",
  },
  upper_header_subtexts: {
    fontWeight: "bold",
    fontSize: 32,
    color: "white",
  },
  header: {
    marginVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    // width: '100%',
    // backgroundColor: 'red',
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  menu_button: {
    height: 30,
    width: 30,
  },
  menu_icon_right: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
    tintColor: "#808080",
  },
  menu_icon_left: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    tintColor: "#87b5eb",
  },
  header_title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  product_title: {
    fontSize: 16,
    fontWeight: "600",
  },
  merchant_name: {
    fontSize: 14,
    marginBottom: 10,
  },
  add_product: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#99DFB2",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  text_input: {
    width: "100%",
    //height: 45,
    backgroundColor: "#f1f2f3",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});
