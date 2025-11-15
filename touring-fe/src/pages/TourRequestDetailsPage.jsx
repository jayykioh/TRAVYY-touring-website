import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import TourRequestChat from '../components/chat/TourRequestChat';
import axios from 'axios';
import logger from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function TourRequestDetailsPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [tourRequest, setTourRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT to get user info (simple decode, not validation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser({
        id: payload.sub || payload._id || payload.id,
        role: payload.role === 'TourGuide' ? 'guide' : 'user',
        name: payload.name
      });
    }
  }, []);

  // Fetch tour request details
  const fetchTourRequest = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const isGuide = currentUser?.role === 'guide';
      
      const endpoint = isGuide
        ? `/api/guide/custom-requests/${requestId}`
        : `/api/tour-requests/${requestId}`;

      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTourRequest(response.data.tourRequest);
      }
    } catch (error) {
      logger.error('Error fetching tour request:', error);
      alert('Failed to load tour request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && requestId) {
      fetchTourRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, currentUser]);

  if (loading || !currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!tourRequest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Tour request not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {tourRequest.tourDetails.zoneName}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {tourRequest.tourDetails.items?.length || 0} locations
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {tourRequest.tourDetails.numberOfDays} days
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {tourRequest.tourDetails.numberOfGuests} guests
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600">Request Number</div>
            <div className="text-lg font-semibold">{tourRequest.requestNumber}</div>
            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              tourRequest.status === 'accepted' ? 'bg-green-100 text-green-800' :
              tourRequest.status === 'agreement_pending' ? 'bg-blue-100 text-blue-800' :
              tourRequest.status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tourRequest.status}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget & Price */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Budget & Price</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Initial Budget:</span>
                <span className="font-semibold">
                  {tourRequest.initialBudget?.amount?.toLocaleString('vi-VN')} {tourRequest.initialBudget?.currency}
                </span>
              </div>
              {tourRequest.finalPrice?.amount && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Final Agreed Price:</span>
                  <span className="font-semibold text-lg">
                    {tourRequest.finalPrice.amount.toLocaleString('vi-VN')} {tourRequest.finalPrice.currency}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Itinerary Details */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Itinerary</h3>
            <div className="space-y-3">
              {tourRequest.tourDetails.items?.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.address}</div>
                    {item.startTime && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.startTime} - {item.endTime} ({item.duration} mins)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Requirements */}
          {tourRequest.specialRequirements && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Special Requirements</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {tourRequest.specialRequirements}
              </p>
            </div>
          )}

          {/* Chat Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <TourRequestChat
                requestId={requestId}
                currentUser={currentUser}
                tourRequest={tourRequest}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Phone:</span>
                <div className="font-medium">{tourRequest.contactInfo?.phone}</div>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <div className="font-medium">{tourRequest.contactInfo?.email}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {currentUser.role === 'user' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              
              <div className="text-center text-gray-600 py-4">
                <p className="text-sm mb-2">💬 Thanh toán trực tiếp trong chat</p>
                <p className="text-xs text-gray-500">Sau khi thỏa thuận xong, nút thanh toán sẽ xuất hiện trong hộp chat</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Request Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Messages:</span>
                <span className="font-medium">{tourRequest.messages?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price Offers:</span>
                <span className="font-medium">{tourRequest.priceOffers?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(tourRequest.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
