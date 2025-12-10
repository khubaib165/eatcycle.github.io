import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Package,
  MessageCircle,
  X,
  Send,
  Phone,
  MapPin,
  Building,
  Trash2,
  CheckCircle,
  Calendar,
  Utensils,
} from "lucide-react";

export default function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("donations");
  const [loading, setLoading] = useState(false);

  const [newDonation, setNewDonation] = useState({
    instituteName: "",
    phone: "",
    address: "",
    foodName: "",
    foodType: "Cooked Food",
    amount: "",
    expiryDate: "",
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
    loadDonationsFromBackend();
    loadOrdersFromFirestore();

    // Refresh orders every 3 seconds to check for new orders
    const interval = setInterval(() => {
      loadOrdersFromFirestore();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Poll for new messages when chat is open
  useEffect(() => {
    let interval;
    if (showChat && selectedRecipient) {
      loadChatMessages(selectedRecipient.orderId);
      interval = setInterval(() => {
        loadChatMessages(selectedRecipient.orderId);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showChat, selectedRecipient]);

  // Load donations from backend API - Only my donations
  const loadDonationsFromBackend = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("Please login first");
        setLoading(false);
        return;
      }

      // Using the backend API endpoint to get user-specific listings
      const response = await fetch(`${API_BASE_URL}/users/${userId}/listings`);

      if (response.ok) {
        const data = await response.json();
        // Filter to ensure we only show listings where donorId matches current user
        const formattedDonations = data.listings
          .filter((listing) => listing.donorId === userId)
          .map((listing) => ({
            id: listing.id,
            instituteName: listing.instituteName || "N/A",
            phone: listing.phone || "",
            address: listing.address || "",
            foodName: listing.foodName || "",
            foodType: listing.foodType || "",
            amount: listing.amount || "",
            expiryDate: listing.expiry || "",
            status: listing.status || "Available",
            createdAt: listing.createdAt || "",
            donorId: listing.donorId || "",
          }));
        setDonations(formattedDonations);
      } else {
        console.error("Failed to load donations");
      }
    } catch (error) {
      console.error("Error loading donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersFromFirestore = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setOrders([]);
      return;
    }

    try {
      // Load orders from Firestore where donorId matches current user
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/orders`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.documents) {
          const allOrders = data.documents
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
            .filter((order) => order.donorId === userId);
          setOrders(allOrders);
        } else {
          setOrders([]);
        }
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
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

  // Add donation using backend API
  const addDonationToBackend = async () => {
    if (
      !newDonation.instituteName ||
      !newDonation.phone ||
      !newDonation.address ||
      !newDonation.foodName ||
      !newDonation.amount ||
      !newDonation.expiryDate
    ) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("Please login first");
        setLoading(false);
        return;
      }

      const donationData = {
        foodName: newDonation.foodName,
        expiry: newDonation.expiryDate,
        foodType: newDonation.foodType,
        address: newDonation.address,
        phone: newDonation.phone,
        amount: newDonation.amount,
        instituteName: newDonation.instituteName,
        status: "available",
        uid: userId,
      };

      const response = await fetch(`${API_BASE_URL}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Donation added successfully!");
        setNewDonation({
          instituteName: "",
          phone: "",
          address: "",
          foodName: "",
          foodType: "Cooked Food",
          amount: "",
          expiryDate: "",
        });
        setShowAddDonation(false);
        loadDonationsFromBackend();
      } else {
        const errorData = await response.json();
        alert(
          "Failed to add donation: " + (errorData.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error adding donation:", error);
      alert("Error adding donation: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete donation using backend API
  const deleteDonationFromBackend = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Donation deleted successfully!");
        loadDonationsFromBackend();
      } else {
        const errorData = await response.json();
        alert(
          "Failed to delete donation: " + (errorData.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error deleting donation:", error);
      alert("Error deleting donation: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update donation status using backend API
  const updateDonationStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadDonationsFromBackend();
      } else {
        console.error("Failed to update donation status");
      }
    } catch (error) {
      console.error("Error updating donation status:", error);
    }
  };

  const openChat = (recipient) => {
    setSelectedRecipient(recipient);
    setShowChat(true);
    loadChatMessages(recipient.orderId);
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    const messageData = {
      fields: {
        sender: { stringValue: "donor" },
        text: { stringValue: messageInput },
        timestamp: { stringValue: new Date().toISOString() },
      },
    };

    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/chats/${selectedRecipient.orderId}/messages`,
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
        loadChatMessages(selectedRecipient.orderId);
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message: " + error.message);
    }
  };

  const markAsCompleted = async (orderId) => {
    // Find the order to get its firestoreId
    const order = orders.find((o) => o.orderId === orderId);
    if (!order || !order.firestoreId) {
      alert("Order not found");
      return;
    }

    try {
      // Update order status in Firestore
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/orders/${order.firestoreId}?updateMask.fieldPaths=status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              status: { stringValue: "Completed" },
            },
          }),
        }
      );

      if (response.ok) {
        alert("Order marked as completed!");
        loadOrdersFromFirestore();
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-xl">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Donor Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your donations and help those in need
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("donations")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "donations"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              My Donations ({donations.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "orders"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Orders ({orders.length})
            </button>
          </div>
        </div>

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <div>
            <button
              onClick={() => setShowAddDonation(true)}
              disabled={loading}
              className="mb-6 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-medium flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Add New Donation
            </button>

            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading donations...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {donation.foodName}
                        </h3>
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {donation.foodType}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteDonationFromBackend(donation.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-gray-600 text-sm">
                      <p className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <strong>Institute:</strong> {donation.instituteName}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <strong>Phone:</strong> {donation.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <strong>Address:</strong> {donation.address}
                      </p>
                      <p className="flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        <strong>Amount:</strong> {donation.amount}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <strong>Expiry:</strong>{" "}
                        {new Date(donation.expiryDate).toLocaleDateString()}
                      </p>
                      <div className="pt-2 border-t border-gray-200 mt-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            donation.status === "available"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {donation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && donations.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  No donations yet. Add your first donation!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {orders.map((order) => (
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
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Recipient Details:
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-gray-700">
                    <p>
                      <strong>Name:</strong> {order.recipientName}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.recipientPhone}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.recipientEmail}
                    </p>
                    <p className="md:col-span-2">
                      <strong>Address:</strong> {order.recipientAddress}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => openChat(order)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat with Recipient
                  </button>
                  {order.status !== "Completed" && (
                    <button
                      onClick={() => markAsCompleted(order.orderId)}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  No orders yet. When recipients place orders, they will appear
                  here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Add Donation Modal */}
        {showAddDonation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Add New Donation
                </h2>
                <button
                  onClick={() => setShowAddDonation(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institute Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={newDonation.instituteName}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          instituteName: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter institute name"
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
                      value={newDonation.phone}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          phone: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={newDonation.address}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          address: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name of Food *
                  </label>
                  <input
                    type="text"
                    value={newDonation.foodName}
                    onChange={(e) =>
                      setNewDonation({
                        ...newDonation,
                        foodName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Rice, Bread, Vegetables"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Food *
                  </label>
                  <select
                    value={newDonation.foodType}
                    onChange={(e) =>
                      setNewDonation({
                        ...newDonation,
                        foodType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option>Cooked Food</option>
                    <option>Raw Food</option>
                    <option>Packaged Food</option>
                    <option>Fruits & Vegetables</option>
                    <option>Dairy Products</option>
                    <option>Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount/Quantity *
                  </label>
                  <input
                    type="text"
                    value={newDonation.amount}
                    onChange={(e) =>
                      setNewDonation({ ...newDonation, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 5 kg, 10 portions, 20 servings"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={newDonation.expiryDate}
                    onChange={(e) =>
                      setNewDonation({
                        ...newDonation,
                        expiryDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={addDonationToBackend}
                disabled={loading}
                className="w-full mt-6 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Adding Donation..." : "Add Donation"}
              </button>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChat && selectedRecipient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col">
              <div className="bg-green-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">
                    {selectedRecipient.recipientName}
                  </h3>
                  <p className="text-sm text-green-100">
                    Order #{selectedRecipient.orderId}
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
                      msg.sender === "donor" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === "donor"
                          ? "bg-green-500 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === "donor"
                            ? "text-green-100"
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
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
