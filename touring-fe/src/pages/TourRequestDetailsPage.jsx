import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import TourRequestChat from '../../components/chat/TourRequestChat';
import AgreementPanel from '../../components/agreement/AgreementPanel';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function TourRequestDetailsPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [tourRequest, setTourRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [creatingBooking, setCreatingBooking] = useState(false);

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
      console.error('Error fetching tour request:', error);
      alert('Failed to load tour request');
    } finally {
      setLoading(false);
    }
  };

  // Create booking from request
  const handleCreateBooking = async () => {
    if (!tourRequest?.agreement?.completedAt) {
      alert('Both parties must agree to terms before creating booking!');
      return;
    }

    try {
      setCreatingBooking(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/api/tour-requests/${requestId}/create-booking`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('🎉 Booking created successfully!');
        navigate(`/payment/${response.data.booking._id}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setCreatingBooking(false);
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

  const bothAgreed = tourRequest.agreement?.userAgreed && tourRequest.agreement?.guideAgreed;

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
          <Card className="p-6">
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
          </Card>

          {/* Itinerary Details */}
          <Card className="p-6">
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
          </Card>

          {/* Special Requirements */}
          {tourRequest.specialRequirements && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Special Requirements</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {tourRequest.specialRequirements}
              </p>
            </Card>
          )}

          {/* Tabs for Chat & Agreement */}
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="agreement">Agreement</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-4">
              <TourRequestChat
                requestId={requestId}
                currentUser={currentUser}
              />
            </TabsContent>
            
            <TabsContent value="agreement" className="mt-4">
              <AgreementPanel
                requestId={requestId}
                currentUser={currentUser}
                tourRequest={tourRequest}
                onAgreementComplete={() => {
                  fetchTourRequest();
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card className="p-6">
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
          </Card>

          {/* Action Buttons */}
          {currentUser.role === 'user' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              
              {bothAgreed ? (
                <Button
                  onClick={handleCreateBooking}
                  disabled={creatingBooking}
                  className="w-full"
                  size="lg"
                >
                  {creatingBooking ? (
                    'Creating Booking...'
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Create Booking & Pay
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center text-gray-600 py-4">
                  <p className="text-sm mb-2">Both parties must agree to terms before booking</p>
                  <p className="text-xs text-gray-500">Go to Agreement tab to confirm</p>
                </div>
              )}
            </Card>
          )}

          {/* Stats */}
          <Card className="p-6">
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
          </Card>
        </div>
      </div>
    </div>
  );
}
