

"use client";



import { gql } from "@apollo/client";

import { useMutation } from "@apollo/client/react";

import Link from "next/link";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Script from "next/script";



import Header from "../../components/Header/Header";



const CREATE_ORDER = gql`

  mutation CreateOrder(

    $userId: String!

    $items: [OrderItemInput!]!

    $totalAmount: Float!

    $paymentMode: String

    $status: String

  ) {

    createOrder(

      userId: $userId

      items: $items

      totalAmount: $totalAmount

      paymentMode: $paymentMode

      status: $status

    ) {

      id

      userId

      items {

        productId

        quantity

        size

        colour

        totalAmount

      }

      totalAmount

      paymentMode

      status

    }

  }

`;



const DELETE_BASKET = gql`

  mutation DeleteBasket($id: ID!) {

    deleteBasket(id: $id) {

      id

    }

  }

`;



type CheckoutItem = {

  basketId: string;

  productId: string;

  name: string;

  price: number;

  quantity: number;

  size?: string;

  colour?: string;

  image?: string;

};



type RazorpayResponse = {

  razorpay_payment_id: string;

  razorpay_order_id: string;

  razorpay_signature: string;

};



type RazorpayInstrument = {

  method: string;

};



type RazorpayBlock = {

  name: string;

  instruments: RazorpayInstrument[];

};



type RazorpayOptions = {

  key: string;

  amount: number;

  currency: string;

  name: string;

  description: string;

  order_id: string;



  prefill?: {

    name?: string;

    email?: string;

    contact?: string;

  };



  notes?: {

    [key: string]: string;

  };



  theme?: {

    color?: string;

  };



  config?: {

    display?: {

      blocks?: {

        upi?: RazorpayBlock;

        card?: RazorpayBlock;

        netbanking?: RazorpayBlock;

      };



      sequence?: string[];



      preferences?: {

        show_default_blocks?: boolean;

      };

    };

  };



  handler: (

    response: RazorpayResponse

  ) => void | Promise<void>;



  modal?: {

    ondismiss?: () => void;

  };

};



type RazorpayInstance = {

  open: () => void;



  on: (

    event: string,

    callback: (response: unknown) => void

  ) => void;

};



declare global {

  interface Window {

    Razorpay: new (

      options: RazorpayOptions

    ) => RazorpayInstance;

  }

}



export default function CheckoutPage() {

  const router = useRouter();



  const [items, setItems] = useState<CheckoutItem[]>([]);



  const [loading, setLoading] = useState(true);



  const [placingOrder, setPlacingOrder] =

    useState(false);



  const [message, setMessage] = useState("");



  const [paymentMode, setPaymentMode] =

    useState("COD");



  const [

    onlinePaymentOption,

    setOnlinePaymentOption,

  ] = useState("");



  const [

    razorpayLoaded,

    setRazorpayLoaded,

  ] = useState(false);



  const [createOrder] =

    useMutation<any>(CREATE_ORDER);



  const [deleteBasket] =

    useMutation<any>(DELETE_BASKET);



  // =========================================

  // LOAD CHECKOUT ITEMS

  // =========================================



  useEffect(() => {

    const storedItems =

      localStorage.getItem("checkoutItems");



    if (!storedItems) {

      setItems([]);

      setLoading(false);

      return;

    }



    try {

      const parsedItems =

        JSON.parse(storedItems);



      if (Array.isArray(parsedItems)) {

        setItems(parsedItems);

      } else {

        setItems([]);

      }

    } catch (error) {

      console.error(

        "CHECKOUT ITEMS ERROR:",

        error

      );



      setItems([]);

    }



    setLoading(false);

  }, []);



  // =========================================

  // TOTALS

  // =========================================



  const subtotal = items.reduce(

    (total, item) => {

      const price =

        Number(item.price) || 0;



      const quantity =

        Number(item.quantity) || 0;



      return total + price * quantity;

    },

    0

  );



  const totalItems = items.reduce(

    (total, item) => {

      return (

        total +

        (Number(item.quantity) || 0)

      );

    },

    0

  );



  // =========================================

  // BUILD ORDER ITEMS

  // =========================================



  const buildOrderItems = () => {

    return items.map((item) => {

      const productId = String(

        item.productId || ""

      ).trim();



      const quantity = Number(

        item.quantity

      );



      const price = Number(

        item.price

      );



      if (!productId) {

        throw new Error(

          `Product ID is missing for ${

            item.name || "product"

          }.`

        );

      }



      if (

        !Number.isFinite(quantity) ||

        quantity <= 0

      ) {

        throw new Error(

          `Invalid quantity for ${

            item.name || "product"

          }.`

        );

      }



      if (

        !Number.isFinite(price) ||

        price < 0

      ) {

        throw new Error(

          `Invalid price for ${

            item.name || "product"

          }.`

        );

      }



      return {

        productId,

        quantity,

        size: item.size || null,

        colour: item.colour || null,

        totalAmount:

          price * quantity,

      };

    });

  };



  // =========================================

  // SAVE LAST ORDER

  // =========================================



  const saveLastOrder = (

    orderId: string,

    paymentModeValue: string,

    totalAmount: number

  ) => {

    const lastOrder = {

      orderId: String(orderId),

      paymentMode: paymentModeValue,

      totalAmount: Number(totalAmount),

    };



    localStorage.setItem(

      "lastOrder",

      JSON.stringify(lastOrder)

    );



    console.log(

      "LAST ORDER SAVED:",

      lastOrder

    );

  };



  // =========================================

  // CLEAR PURCHASED BASKET ITEMS

  // =========================================



  const clearPurchasedBasketItems =

    async () => {

      const basketIds = items

        .map(

          (item) =>

            item.basketId

        )

        .filter(Boolean);



      console.log(

        "BASKET ITEMS TO DELETE:",

        basketIds

      );



      await Promise.all(

        basketIds.map(

          (basketId) =>

            deleteBasket({

              variables: {

                id: String(

                  basketId

                ),

              },

            })

        )

      );



      console.log(

        "PURCHASED BASKET ITEMS REMOVED"

      );

    };



  // =========================================

  // CREATE DATABASE ORDER

  // =========================================



  const createDatabaseOrder =

    async (

      user: {

        id: string;

        name?: string;

        email?: string;

        phone?: string;

      },

      paymentModeValue: string

    ) => {

      const orderItems =

        buildOrderItems();



      const orderTotal =

        orderItems.reduce(

          (total, item) =>

            total +

            item.totalAmount,

          0

        );



      console.log(

        "CREATE DATABASE ORDER"

      );



      console.log(

        "USER ID:",

        user.id

      );



      console.log(

        "ORDER ITEMS:",

        orderItems

      );



      console.log(

        "ORDER TOTAL:",

        orderTotal

      );



      console.log(

        "PAYMENT MODE:",

        paymentModeValue

      );



      const result =

        await createOrder({

          variables: {

            userId: String(

              user.id

            ),



            items: orderItems,



            totalAmount:

              orderTotal,



            paymentMode:

              paymentModeValue,



            status: "pending",

          },

        });



      console.log(

        "ORDER CREATED:",

        result

      );



      const createdOrder =

        result?.data?.createOrder;



      if (!createdOrder?.id) {

        throw new Error(

          "Order was created, but the Order ID could not be received."

        );

      }



      saveLastOrder(

        String(

          createdOrder.id

        ),

        paymentModeValue,

        Number(

          createdOrder.totalAmount

        ) || orderTotal

      );



      await clearPurchasedBasketItems();



      localStorage.removeItem(

        "checkoutItems"

      );



      router.push(

        "/order-success"

      );

    };



  // =========================================

  // RAZORPAY ONLINE PAYMENT

  // =========================================



  const handleOnlinePayment =

    async (

      user: {

        id: string;

        name?: string;

        email?: string;

        phone?: string;

      }

    ) => {

      if (!onlinePaymentOption) {

        setMessage(

          "Please select an online payment option."

        );



        return;

      }



      if (!razorpayLoaded) {

        setMessage(

          "Payment gateway is still loading. Please try again in a moment."

        );



        return;

      }



      try {

        setPlacingOrder(true);

        setMessage("");



        const orderItems =

          buildOrderItems();



        const orderTotal =

          orderItems.reduce(

            (total, item) =>

              total +

              item.totalAmount,

            0

          );



        console.log(

          "RAZORPAY AMOUNT:",

          orderTotal

        );



        console.log(

          "SELECTED ONLINE PAYMENT METHOD:",

          onlinePaymentOption

        );



        // =====================================

        // CREATE RAZORPAY ORDER

        // =====================================



        const paymentResponse =

          await fetch(

            "/api/payment",

            {

              method: "POST",



              headers: {

                "Content-Type":

                  "application/json",

              },



              body: JSON.stringify({

                amount:

                  orderTotal,

              }),

            }

          );



        const paymentData =

          await paymentResponse.json();



        console.log(

          "RAZORPAY ORDER RESPONSE:",

          paymentData

        );



        if (

          !paymentResponse.ok ||

          !paymentData?.success ||

          !paymentData?.order?.id ||

          !paymentData?.keyId

        ) {

          throw new Error(

            paymentData?.message ||

              "Unable to create Razorpay payment order."

          );

        }



        const razorpayOrder =

          paymentData.order;



        const razorpayKey =

          paymentData.keyId;



        // =====================================

        // RAZORPAY CHECKOUT OPTIONS

        // =====================================



        const options: RazorpayOptions =

          {

            key: razorpayKey,



            amount:

              razorpayOrder.amount,



            currency:

              razorpayOrder.currency ||

              "INR",



            name:

              "Arunodaya Collections",



            description:

              "Order payment",



            order_id:

              razorpayOrder.id,



            prefill: {

              name:

                user.name || "",



              email:

                user.email || "",



              contact:

                user.phone || "",

            },



            notes: {

              userId:

                String(

                  user.id

                ),



              paymentMethod:

                onlinePaymentOption,

            },



            theme: {

              color:

                "#C9A227",

            },



            handler:

              async (

                response

              ) => {

                try {

                  console.log(

                    "RAZORPAY PAYMENT RESPONSE:",

                    response

                  );



                  setMessage(

                    "Verifying payment..."

                  );



                  // =================================

                  // VERIFY PAYMENT

                  // =================================



                  const verifyResponse =

                    await fetch(

                      "/api/payment/verify",

                      {

                        method:

                          "POST",



                        headers: {

                          "Content-Type":

                            "application/json",

                        },



                        body:

                          JSON.stringify(

                            {

                              razorpay_order_id:

                                response.razorpay_order_id,



                              razorpay_payment_id:

                                response.razorpay_payment_id,



                              razorpay_signature:

                                response.razorpay_signature,

                            }

                          ),

                      }

                    );



                  const verifyData =

                    await verifyResponse.json();



                  console.log(

                    "PAYMENT VERIFICATION RESPONSE:",

                    verifyData

                  );



                  if (

                    !verifyResponse.ok ||

                    !verifyData?.success

                  ) {

                    throw new Error(

                      verifyData?.message ||

                        "Payment verification failed."

                    );

                  }



                  setMessage(

                    "Payment successful. Creating your order..."

                  );



                  // =================================

                  // CREATE DATABASE ORDER

                  // =================================



                  await createDatabaseOrder(

                    user,

                    "ONLINE"

                  );

                } catch (error) {

                  console.error(

                    "ONLINE PAYMENT COMPLETION ERROR:",

                    error

                  );



                  if (

                    error instanceof

                    Error

                  ) {

                    setMessage(

                      error.message

                    );

                  } else {

                    setMessage(

                      "Payment was successful, but we could not complete the order."

                    );

                  }



                  setPlacingOrder(

                    false

                  );

                }

              },



            modal: {

              ondismiss:

                () => {

                  console.log(

                    "RAZORPAY CHECKOUT CLOSED"

                  );



                  setMessage(

                    "Payment was cancelled or the payment window was closed."

                  );



                  setPlacingOrder(

                    false

                  );

                },

            },

          };



        // =====================================

        // REQUEST UPI FROM RAZORPAY

        // =====================================



        if (

          onlinePaymentOption ===

          "UPI"

        ) {

          options.config = {

            display: {

              blocks: {

                upi: {

                  name: "UPI",

                  instruments: [

                    {

                      method: "upi",

                    },

                  ],

                },

              },



              sequence: [

                "block.upi",

              ],



              /*

                IMPORTANT:

                Keep Razorpay's default payment

                methods available as well.



                This avoids the previous

                "No appropriate payment method found"

                problem caused by hiding all

                default methods.

              */

              preferences: {

                show_default_blocks: true,

              },

            },

          };

        }



        // =====================================

        // REQUEST CARD FROM RAZORPAY

        // =====================================



        if (

          onlinePaymentOption ===

          "CARD"

        ) {

          options.config = {

            display: {

              blocks: {

                card: {

                  name: "Cards",

                  instruments: [

                    {

                      method: "card",

                    },

                  ],

                },

              },



              sequence: [

                "block.card",

              ],



              preferences: {

                show_default_blocks: true,

              },

            },

          };

        }



        // =====================================

        // REQUEST NET BANKING

        // =====================================



        if (

          onlinePaymentOption ===

          "NETBANKING"

        ) {

          options.config = {

            display: {

              blocks: {

                netbanking: {

                  name: "Net Banking",

                  instruments: [

                    {

                      method:

                        "netbanking",

                    },

                  ],

                },

              },



              sequence: [

                "block.netbanking",

              ],



              preferences: {

                show_default_blocks: true,

              },

            },

          };

        }



        // =====================================

        // CREATE RAZORPAY INSTANCE

        // =====================================



        const razorpay =

          new window.Razorpay(

            options

          );



        // =====================================

        // PAYMENT FAILED EVENT

        // =====================================



        razorpay.on(

          "payment.failed",

          (response: unknown) => {

            console.error(

              "RAZORPAY PAYMENT FAILED:",

              response

            );



            setMessage(

              "Payment failed. Please try again."

            );



            setPlacingOrder(

              false

            );

          }

        );



        // =====================================

        // OPEN RAZORPAY

        // =====================================



        razorpay.open();

      } catch (error) {

        console.error(

          "ONLINE PAYMENT ERROR:",

          error

        );



        if (

          error instanceof Error

        ) {

          setMessage(

            error.message

          );

        } else {

          setMessage(

            "Unable to start online payment."

          );

        }



        setPlacingOrder(false);

      }

    };



  // =========================================

  // PLACE ORDER

  // =========================================



  const handlePlaceOrder =

    async () => {

      setMessage("");



      const authUser =

        localStorage.getItem(

          "authUser"

        );



      if (!authUser) {

        router.push(

          "/customer-login"

        );



        return;

      }



      let user;



      try {

        user = JSON.parse(

          authUser

        );

      } catch (error) {

        console.error(

          "AUTH USER ERROR:",

          error

        );



        localStorage.removeItem(

          "authUser"

        );



        localStorage.removeItem(

          "authToken"

        );



        router.push(

          "/customer-login"

        );



        return;

      }



      if (!user?.id) {

        setMessage(

          "User information is missing. Please login again."

        );



        return;

      }



      if (items.length === 0) {

        setMessage(

          "Your basket is empty."

        );



        return;

      }



      if (!paymentMode) {

        setMessage(

          "Please select a payment method."

        );



        return;

      }



      // =====================================

      // ONLINE PAYMENT

      // =====================================



      if (

        paymentMode ===

        "ONLINE"

      ) {

        await handleOnlinePayment(

          user

        );



        return;

      }



      // =====================================

      // COD

      // =====================================



      try {

        setPlacingOrder(true);



        await createDatabaseOrder(

          user,

          "COD"

        );

      } catch (error) {

        console.error(

          "PLACE COD ORDER ERROR:",

          error

        );



        if (

          error instanceof Error

        ) {

          setMessage(

            error.message

          );

        } else {

          setMessage(

            "Failed to place order."

          );

        }



        setPlacingOrder(false);

      }

    };



  // =========================================

  // LOADING

  // =========================================



  if (loading) {

    return (

      <>

        <Header />



        <main className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">

          <p className="text-[#0B1F3A] text-lg font-medium">

            Loading checkout...

          </p>

        </main>

      </>

    );

  }



  // =========================================

  // EMPTY CHECKOUT

  // =========================================



  if (items.length === 0) {

    return (

      <>

        <Header />



        <main className="min-h-screen bg-[#F8F9FB] px-6 py-16">

          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-10 text-center">



            <div className="text-5xl mb-5">

              ðŸ›’

            </div>



            <h1 className="text-3xl font-bold text-[#0B1F3A] mb-3">

              Your checkout is empty

            </h1>



            <p className="text-gray-500 mb-8">

              Please add some products to your basket before checking out.

            </p>



            <Link

              href="/shop"

              className="inline-block bg-[#0B1F3A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#162f55] transition"

            >

              Continue Shopping

            </Link>



          </div>

        </main>

      </>

    );

  }



  // =========================================

  // MAIN PAGE

  // =========================================



  return (

    <>

      <Script

        src="https://checkout.razorpay.com/v1/checkout.js"

        strategy="afterInteractive"

        onLoad={() =>

          setRazorpayLoaded(true)

        }

        onError={() =>

          setRazorpayLoaded(false)

        }

      />



      <Header />



      <main className="min-h-screen bg-[#F8F9FB] px-4 sm:px-6 py-10">



        <div className="max-w-6xl mx-auto">          {/* PAGE TITLE */}

          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">

                Arunodaya Collections

              </p>

              <h1 className="mt-2 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">

                Secure Checkout

              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">

                Review your products, choose your payment method, and place your order.

              </p>

            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9FB] text-[#C9A227]">

                ✓

              </div>

              <div>

                <p className="text-sm font-bold text-[#0B1F3A]">

                  Secure Checkout

                </p>

                <p className="text-xs text-gray-500">

                  Safe payment process

                </p>

              </div>

            </div>

          </div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">



            {/* ======================================

                PRODUCTS

            ====================================== */}



            <div className="lg:col-span-2">



              <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">



                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">

                      Your order

                    </p>

                    <h2 className="mt-1 text-xl font-bold text-[#0B1F3A]">

                      Your Products

                    </h2>

                  </div>



                  <span className="rounded-full bg-[#F8F9FB] px-3 py-1 text-sm font-semibold text-[#0B1F3A]">

                    {totalItems} {totalItems === 1 ? "item" : "items"}

                  </span>

                </div>



                <div className="divide-y divide-gray-100">

                  {items.map((item, index) => {

                    const price = Number(item.price) || 0;

                    const quantity = Number(item.quantity) || 0;

                    const itemTotal = price * quantity;



                    return (

                      <div

                        key={`${item.productId}-${index}`}

                        className="p-5 transition-colors duration-200 hover:bg-[#F8F9FB]/50 sm:p-6"

                      >

                        <div className="flex gap-4 sm:gap-5">

                          <div className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#F8F9FB] sm:h-32 sm:w-28">

                            {item.image ? (

                              <img

                                src={item.image}

                                alt={item.name || "Product"}

                                className="h-full w-full object-contain"

                              />

                            ) : (

                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">

                                No Image

                              </div>

                            )}

                          </div>



                          <div className="min-w-0 flex-1">

                            <h3 className="text-base font-bold leading-6 text-[#0B1F3A] sm:text-lg">

                              {item.name || "Product"}

                            </h3>



                            <p className="mt-1 text-sm text-gray-500">

                              ₹{price.toLocaleString("en-IN")} each

                            </p>



                            <div className="mt-3 flex flex-wrap gap-2">

                              <span className="rounded-full bg-[#F8F9FB] px-3 py-1 text-xs font-medium text-[#0B1F3A]">

                                Qty: {quantity}

                              </span>



                              {item.size && (

                                <span className="rounded-full bg-[#F8F9FB] px-3 py-1 text-xs font-medium text-[#0B1F3A]">

                                  Size: {item.size}

                                </span>

                              )}



                              {item.colour && (

                                <span className="rounded-full bg-[#F8F9FB] px-3 py-1 text-xs font-medium text-[#0B1F3A]">

                                  Colour: {item.colour}

                                </span>

                              )}

                            </div>



                            <div className="mt-4 flex items-center justify-between gap-4">

                              <span className="text-xs uppercase tracking-wide text-gray-400">

                                Item total

                              </span>



                              <span className="text-lg font-bold text-[#C9A227]">

                                ₹{itemTotal.toLocaleString("en-IN")}

                              </span>

                            </div>

                          </div>

                        </div>

                      </div>

                    );

                  })}

                </div>

              </div>



            </div>



            {/* ======================================

                ORDER SUMMARY

            ====================================== */}



            <div>



              <div className="sticky top-24 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md">



                <div className="bg-[#0B1F3A] px-6 py-5">

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">

                    Secure checkout

                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-white">

                    Order Summary

                  </h2>

                </div>



                <div className="p-6">



                  {/* SUBTOTAL */}



                  <div className="flex items-center justify-between border-b border-gray-100 py-3">

                    <span className="text-sm font-medium text-gray-600">

                      Subtotal

                    </span>



                    <span className="font-semibold text-[#0B1F3A]">

                      ₹{subtotal.toFixed(2)}

                    </span>

                  </div>



                  {/* SHIPPING */}



                  <div className="flex items-center justify-between border-b border-gray-100 py-3">

                    <span className="text-sm font-medium text-gray-600">

                      Shipping

                    </span>



                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">

                      FREE

                    </span>

                  </div>



                  {/* PAYMENT METHOD */}



                  <div className="border-b border-gray-100 py-5">

                    <div className="mb-4">

                      <h3 className="text-lg font-bold text-[#0B1F3A]">

                        Payment Method

                      </h3>

                      <p className="mt-1 text-xs text-gray-400">

                        Choose how you would like to pay

                      </p>

                    </div>



                    <div className="space-y-3">



                      {/* COD */}



                      <label

                        className={`group flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all duration-200 ${

                          paymentMode ===

                          "COD"

                            ? "border-[#C9A227] bg-[#F8F9FB] shadow-sm"

                            : "border-gray-200 bg-white hover:border-[#C9A227]/60 hover:bg-[#F8F9FB]/60"

                        }`}

                      >

                        <input

                          type="radio"

                          name="paymentMode"

                          value="COD"

                          checked={paymentMode === "COD"}

                          onChange={() => {

                            setPaymentMode("COD");

                            setOnlinePaymentOption("");

                            setMessage("");

                          }}

                          className="h-4 w-4 accent-[#C9A227]"

                        />



                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8F9FB] text-xs font-bold text-[#0B1F3A]">

                          COD

                        </div>



                        <div className="min-w-0">

                          <p className="font-semibold text-[#0B1F3A]">

                            Cash on Delivery

                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">

                            Pay when your order is delivered

                          </p>

                        </div>

                      </label>



                      {/* ONLINE PAYMENT */}



                      <label

                        className={`group flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all duration-200 ${

                          paymentMode ===

                          "ONLINE"

                            ? "border-[#C9A227] bg-[#F8F9FB] shadow-sm"

                            : "border-gray-200 bg-white hover:border-[#C9A227]/60 hover:bg-[#F8F9FB]/60"

                        }`}

                      >

                        <input

                          type="radio"

                          name="paymentMode"

                          value="ONLINE"

                          checked={paymentMode === "ONLINE"}

                          onChange={() => {

                            setPaymentMode("ONLINE");

                            setMessage("");

                          }}

                          className="h-4 w-4 accent-[#C9A227]"

                        />



                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8F9FB] text-[10px] font-bold text-[#0B1F3A]">

                          ONLINE

                        </div>



                        <div className="min-w-0">

                          <p className="font-semibold text-[#0B1F3A]">

                            Online Payment

                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">

                            Pay securely online

                          </p>

                        </div>

                      </label>



                    </div>



                    {/* ONLINE PAYMENT OPTIONS */}



                    {paymentMode === "ONLINE" && (

                      <div className="mt-4 rounded-2xl bg-[#F8F9FB] p-3">

                        <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">

                          Select online method

                        </p>



                        <div className="space-y-2">



                          {/* UPI */}



                          <label

                            className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 transition-all duration-200 ${

                              onlinePaymentOption === "UPI"

                                ? "border-[#C9A227] shadow-sm"

                                : "border-gray-200 hover:border-[#C9A227]/60"

                            }`}

                          >

                            <input

                              type="radio"

                              name="onlinePaymentOption"

                              value="UPI"

                              checked={onlinePaymentOption === "UPI"}

                              onChange={() => {

                                setOnlinePaymentOption("UPI");

                                setMessage("");

                              }}

                              className="h-4 w-4 accent-[#C9A227]"

                            />



                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-[#F8F9FB] text-[10px] font-bold text-[#0B1F3A]">

                              UPI

                            </div>



                            <span className="text-sm font-semibold text-[#0B1F3A]">

                              UPI

                            </span>

                          </label>



                          {/* CARD */}



                          <label

                            className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 transition-all duration-200 ${

                              onlinePaymentOption === "CARD"

                                ? "border-[#C9A227] shadow-sm"

                                : "border-gray-200 hover:border-[#C9A227]/60"

                            }`}

                          >

                            <input

                              type="radio"

                              name="onlinePaymentOption"

                              value="CARD"

                              checked={onlinePaymentOption === "CARD"}

                              onChange={() => {

                                setOnlinePaymentOption("CARD");

                                setMessage("");

                              }}

                              className="h-4 w-4 accent-[#C9A227]"

                            />



                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-[#F8F9FB] text-[9px] font-bold text-[#0B1F3A]">

                              CARD

                            </div>



                            <span className="text-sm font-semibold text-[#0B1F3A]">

                              Credit / Debit Card

                            </span>

                          </label>



                          {/* NET BANKING */}



                          <label

                            className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 transition-all duration-200 ${

                              onlinePaymentOption === "NETBANKING"

                                ? "border-[#C9A227] shadow-sm"

                                : "border-gray-200 hover:border-[#C9A227]/60"

                            }`}

                          >

                            <input

                              type="radio"

                              name="onlinePaymentOption"

                              value="NETBANKING"

                              checked={onlinePaymentOption === "NETBANKING"}

                              onChange={() => {

                                setOnlinePaymentOption("NETBANKING");

                                setMessage("");

                              }}

                              className="h-4 w-4 accent-[#C9A227]"

                            />



                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-[#F8F9FB] text-[9px] font-bold text-[#0B1F3A]">

                              NET

                            </div>



                            <span className="text-sm font-semibold text-[#0B1F3A]">

                              Net Banking

                            </span>

                          </label>



                        </div>

                      </div>

                    )}

                  </div>



                  {/* TOTAL */}



                  <div className="flex items-end justify-between gap-4 py-5">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">

                        Total Amount

                      </p>

                      <p className="mt-1 text-sm text-gray-500">

                        {totalItems} {totalItems === 1 ? "item" : "items"} · Shipping free

                      </p>

                    </div>



                    <span className="text-2xl font-bold text-[#0B1F3A]">

                      ₹{subtotal.toFixed(2)}

                    </span>

                  </div>



                  {/* MESSAGE */}



                  {message && (

                    <div

                      className={`mb-4 rounded-xl border p-3 ${

                        message.toLowerCase().includes("successful") ||

                        message.toLowerCase().includes("creating")

                          ? "border-green-200 bg-green-50"

                          : "border-red-200 bg-red-50"

                      }`}

                    >

                      <p

                        className={`text-sm ${

                          message.toLowerCase().includes("successful") ||

                          message.toLowerCase().includes("creating")

                            ? "text-green-600"

                            : "text-red-600"

                        }`}

                      >

                        {message}

                      </p>

                    </div>

                  )}



                  {/* PLACE ORDER / PAY NOW */}



                  <button

                    type="button"

                    onClick={handlePlaceOrder}

                    disabled={placingOrder}

                    className={`group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-bold transition-all duration-200 ${

                      placingOrder

                        ? "cursor-not-allowed bg-gray-400 text-white"

                        : "bg-[#C9A227] text-[#0B1F3A] shadow-sm hover:bg-[#b89218] hover:shadow-md"

                    }`}

                  >

                    {placingOrder ? (

                      <>

                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                        {paymentMode === "ONLINE"

                          ? "Processing Payment..."

                          : "Placing Order..."}

                      </>

                    ) : (

                      <>

                        {paymentMode === "ONLINE" ? "Pay Now" : "Place Order"}

                        <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">

                          →

                        </span>

                      </>

                    )}

                  </button>



                  <Link

                    href="/basket"

                    className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-[#0B1F3A] transition hover:text-[#C9A227]"

                  >

                    ← Back to Basket

                  </Link>



                </div>

              </div>



            </div>



          </div>



        </div>



      </main>

    </>

  );

}
