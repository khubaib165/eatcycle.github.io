import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Utensils,
  MessageCircle,
  X,
  Send,
  Building,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function RecipientDashboard() {
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [recipientDetails, setRecipientDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    reason: "",
  });

  // Backend API base URL - update this to your deployed backend URL
  const API_BASE_URL = "https://us-central1-eat-cycle.cloudfunctions.net/api";

  const firebaseConfig = {
    apiKey: "AIzaSyBs9jU6_1D8aMFIKMY0FQd8QWW4PuNJEjA",
    authDomain: "eat-cycle.firebaseapp.com",
    projectId: "eat-cycle",
    storageBucket: "eat-cycle.firebasestorage.app",
    messagingSenderId: "208388832351",
    appId: "1:208388832351:web:53b8b572de0dd3f21aafea",
    measurementId: "G-C4FT87BNNH",
  };

  useEffect(() => {
    loadAvailableDonations();
    loadMyOrders();

    // Refresh orders every 3 seconds to check for status updates
    const interval = setInterval(() => {
      loadMyOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Poll for new messages when chat is open
  useEffect(() => {
    let interval;
    if (showChat && selectedOrder) {
      loadChatMessages(selectedOrder.orderId);
      interval = setInterval(() => {
        loadChatMessages(selectedOrder.orderId);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showChat, selectedOrder]);

  // Load available donations from backend API
  const loadAvailableDonations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/listings`);

      if (response.ok) {
        const data = await response.json();
        // Filter only available donations
        const availableListings = data.listings
          .filter((listing) => listing.status === "available")
          .map((listing) => ({
            id: listing.id,
            instituteName: listing.instituteName || "N/A",
            phone: listing.phone || "",
            address: listing.address || "",
            foodName: listing.foodName || "",
            foodType: listing.foodType || "",
            amount: listing.amount || "",
            expiryDate: listing.expiry || "",
            status: listing.status || "available",
            createdAt: listing.createdAt || "",
            donorId: listing.donorId || "",
          }));
        setAvailableDonations(availableListings);
      } else {
        console.error("Failed to load donations");
      }
    } catch (error) {
      console.error("Error loading donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyOrders = async () => {
    const recipientId = localStorage.getItem("userId");

    if (!recipientId) {
      setMyOrders([]);
      return;
    }

    try {
      // Load orders from Firestore where recipientId matches current user
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/orders`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.documents) {
          const orders = data.documents
            .map((doc) => {
              const fields = doc.fields;
              return {
                orderId: fields.orderId?.stringValue || "",
                donationId: fields.donationId?.stringValue || "",
                donorId: fields.donorId?.stringValue || "",
                recipientId: fields.recipientId?.stringValue || "",
                foodItem: fields.foodItem?.stringValue || "",
                foodType: fields.foodType?.stringValue || "",
                quantity: fields.quantity?.stringValue || "",
                donorInfo: {
                  instituteName: fields.donorInstituteName?.stringValue || "",
                  phone: fields.donorPhone?.stringValue || "",
                  address: fields.donorAddress?.stringValue || "",
                },
                recipientName: fields.recipientName?.stringValue || "",
                recipientEmail: fields.recipientEmail?.stringValue || "",
                recipientPhone: fields.recipientPhone?.stringValue || "",
                recipientAddress: fields.recipientAddress?.stringValue || "",
                recipientReason: fields.recipientReason?.stringValue || "",
                status: fields.status?.stringValue || "Pending",
                orderDate: fields.orderDate?.stringValue || "",
                firestoreId: doc.name.split("/").pop(),
              };
            })
            .filter((order) => order.recipientId === recipientId);
          setMyOrders(orders);
        } else {
          setMyOrders([]);
        }
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setMyOrders([]);
    }
  };

  const loadChatMessages = async (orderId) => {
    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/chats/${orderId}/messages?orderBy=timestamp`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.documents) {
          const messages = data.documents.map((doc) => {
            const fields = doc.fields;
            return {
              id: doc.name.split("/").pop(),
              sender: fields.sender?.stringValue || "",
              text: fields.text?.stringValue || "",
              timestamp: fields.timestamp?.stringValue || "",
            };
          });
          setChatMessages(messages);
        } else {
          setChatMessages([]);
        }
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
    }
  };

  const filteredDonations = availableDonations.filter(
    (donation) =>
      donation.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.foodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.instituteName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      donation.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openOrderModal = (donation) => {
    setSelectedDonation(donation);
    setShowOrderModal(true);
  };

  const placeOrder = async () => {
    if (placingOrder) return; // Prevent multiple submissions

    if (
      !recipientDetails.name ||
      !recipientDetails.email ||
      !recipientDetails.phone ||
      !recipientDetails.address
    ) {
      alert("Please fill all required fields");
      return;
    }

    const recipientId = localStorage.getItem("userId");

    if (!recipientId) {
      alert("Please login first");
      return;
    }

    setPlacingOrder(true);
    const orderId = Date.now().toString();

    // Save order to Firestore
    const orderData = {
      fields: {
        orderId: { stringValue: orderId },
        donationId: { stringValue: selectedDonation.id },
        donorId: { stringValue: selectedDonation.donorId },
        recipientId: { stringValue: recipientId },
        foodItem: { stringValue: selectedDonation.foodName },
        foodType: { stringValue: selectedDonation.foodType },
        quantity: { stringValue: selectedDonation.amount },
        donorInstituteName: { stringValue: selectedDonation.instituteName },
        donorPhone: { stringValue: selectedDonation.phone },
        donorAddress: { stringValue: selectedDonation.address },
        recipientName: { stringValue: recipientDetails.name },
        recipientEmail: { stringValue: recipientDetails.email },
        recipientPhone: { stringValue: recipientDetails.phone },
        recipientAddress: { stringValue: recipientDetails.address },
        recipientReason: { stringValue: recipientDetails.reason || "" },
        status: { stringValue: "Pending" },
        orderDate: { stringValue: new Date().toISOString() },
      },
    };

    try {
      // Save order to Firestore
      const orderResponse = await fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!orderResponse.ok) {
        alert("Failed to place order");
        return;
      }

      // Update donation status in backend
      const statusResponse = await fetch(
        `${API_BASE_URL}/listings/${selectedDonation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "ordered",
          }),
        }
      );

      if (!statusResponse.ok) {
        console.error("Failed to update status in backend");
      }

      alert("Order placed successfully!");
      setShowOrderModal(false);
      setRecipientDetails({
        name: "",
        email: "",
        phone: "",
        address: "",
        reason: "",
      });
      loadAvailableDonations();
      loadMyOrders();
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order: " + error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const openChat = (order) => {
    setSelectedOrder(order);
    setShowChat(true);
    loadChatMessages(order.orderId);
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    const messageData = {
      fields: {
        sender: { stringValue: "recipient" },
        text: { stringValue: messageInput },
        timestamp: { stringValue: new Date().toISOString() },
      },
    };

    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/chats/${selectedOrder.orderId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        }
      );

      if (response.ok) {
        setMessageInput("");
        loadChatMessages(selectedOrder.orderId);
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-xl">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Recipient Dashboard
              </h1>
              <p className="text-gray-600">
                Browse and request food donations near you
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food name, type, institute, or location..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("available")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "available"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              Available Donations ({filteredDonations.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "orders"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Clock className="w-5 h-5 inline mr-2" />
              My Orders ({myOrders.length})
            </button>
          </div>
        </div>

        {/* Available Donations Tab */}
        {activeTab === "available" && (
          <div>
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading donations...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {donation.foodName}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {donation.foodType}
                      </span>
                    </div>

                    <div className="space-y-2 text-gray-600 text-sm mb-4">
                      <p className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <strong>Donor:</strong> {donation.instituteName}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <strong>Location:</strong> {donation.address}
                      </p>
                      <p className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-gray-500" />
                        <strong>Amount:</strong> {donation.amount}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <strong>Expires:</strong>{" "}
                        {new Date(donation.expiryDate).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <strong>Contact:</strong> {donation.phone}
                      </p>
                    </div>

                    <button
                      onClick={() => openOrderModal(donation)}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Request This Donation
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredDonations.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  No donations found matching your search.
                </p>
              </div>
            )}
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {myOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {order.foodItem} - {order.quantity}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Ordered on {new Date(order.orderDate).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Donor Details:
                    </h4>
                    <div className="space-y-2 text-gray-700 text-sm">
                      <p>
                        <strong>Institute:</strong>{" "}
                        {order.donorInfo.instituteName}
                      </p>
                      <p>
                        <strong>Phone:</strong> {order.donorInfo.phone}
                      </p>
                      <p>
                        <strong>Address:</strong> {order.donorInfo.address}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Your Details:
                    </h4>
                    <div className="space-y-2 text-gray-700 text-sm">
                      <p>
                        <strong>Name:</strong> {order.recipientName}
                      </p>
                      <p>
                        <strong>Phone:</strong> {order.recipientPhone}
                      </p>
                      <p>
                        <strong>Address:</strong> {order.recipientAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {order.recipientReason && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Reason:</strong> {order.recipientReason}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => openChat(order)}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat with Donor
                </button>
              </div>
            ))}

            {myOrders.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  No orders yet. Browse available donations to place your first
                  order!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Order Modal */}
        {showOrderModal && selectedDonation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Request Donation
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-2">
                  Donation Details:
                </h3>
                <p className="text-gray-700">
                  <strong>Food:</strong> {selectedDonation.foodName}
                </p>
                <p className="text-gray-700">
                  <strong>Type:</strong> {selectedDonation.foodType}
                </p>
                <p className="text-gray-700">
                  <strong>Amount:</strong> {selectedDonation.amount}
                </p>
                <p className="text-gray-700">
                  <strong>From:</strong> {selectedDonation.instituteName}
                </p>
              </div>

              <h3 className="font-bold text-gray-800 mb-4">
                Enter Your Details:
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={recipientDetails.name}
                      onChange={(e) =>
                        setRecipientDetails({
                          ...recipientDetails,
                          name: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={recipientDetails.email}
                      onChange={(e) =>
                        setRecipientDetails({
                          ...recipientDetails,
                          email: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={recipientDetails.phone}
                      onChange={(e) =>
                        setRecipientDetails({
                          ...recipientDetails,
                          phone: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={recipientDetails.address}
                      onChange={(e) =>
                        setRecipientDetails({
                          ...recipientDetails,
                          address: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={recipientDetails.reason}
                    onChange={(e) =>
                      setRecipientDetails({
                        ...recipientDetails,
                        reason: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Why do you need this donation? (Optional)"
                  ></textarea>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placingOrder}
                className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {placingOrder ? "Placing Order..." : "Place Order Request"}
              </button>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChat && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col">
              <div className="bg-blue-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">
                    {selectedOrder.donorInfo.instituteName}
                  </h3>
                  <p className="text-sm text-blue-100">
                    Order #{selectedOrder.orderId}
                  </p>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "recipient"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === "recipient"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === "recipient"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
