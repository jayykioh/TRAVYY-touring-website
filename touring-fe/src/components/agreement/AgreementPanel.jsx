import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AgreementPanel({ requestId, currentUser, tourRequest, onAgreementComplete }) {
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agreeing, setAgreeing] = useState(false);
  const [showTermsForm, setShowTermsForm] = useState(false);
  
  // Terms form state
  const [terms, setTerms] = useState({
    finalPrice: tourRequest?.finalPrice?.amount || tourRequest?.initialBudget?.amount || 0,
    currency: tourRequest?.finalPrice?.currency || tourRequest?.initialBudget?.currency || 'VND',
    numberOfGuests: tourRequest?.tourDetails?.numberOfGuests || 1,
    specialConditions: ''
  });

  const isGuide = currentUser.role === 'guide';

  // Fetch agreement status
  const fetchAgreementStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = isGuide
        ? `/api/guide/custom-requests/${requestId}/agreement`
        : `/api/tour-requests/${requestId}/agreement`;

      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAgreement(response.data.agreement);
        if (response.data.agreement?.terms) {
          setTerms(prev => ({
            ...prev,
            ...response.data.agreement.terms
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching agreement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agree to terms
  const handleAgree = async () => {
    if (!terms.finalPrice || terms.finalPrice <= 0) {
      alert('Please enter a valid final price');
      return;
    }

    if (terms.numberOfGuests < 1 || terms.numberOfGuests > 10) {
      alert('Number of guests must be between 1 and 10');
      return;
    }

    try {
      setAgreeing(true);
      const token = localStorage.getItem('token');
      const endpoint = isGuide
        ? `/api/guide/custom-requests/${requestId}/agree`
        : `/api/tour-requests/${requestId}/agree`;

      const response = await axios.post(
        `${API_URL}${endpoint}`,
        { terms },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setAgreement(response.data.tourRequest.agreement);
        setShowTermsForm(false);
        
        if (response.data.bothAgreed) {
          alert('🎉 Both parties have agreed! You can now proceed to create booking.');
          onAgreementComplete?.();
        } else {
          alert('✅ You have agreed to the terms. Waiting for the other party to confirm.');
        }
      }
    } catch (error) {
      console.error('Error agreeing to terms:', error);
      alert(error.response?.data?.error || 'Failed to agree to terms');
    } finally {
      setAgreeing(false);
    }
  };

  useEffect(() => {
    fetchAgreementStatus();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchAgreementStatus, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  if (loading && !agreement) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Loading agreement status...</span>
        </div>
      </Card>
    );
  }

  const userAgreed = agreement?.userAgreed || false;
  const guideAgreed = agreement?.guideAgreed || false;
  const bothAgreed = userAgreed && guideAgreed;
  const hasAgreed = isGuide ? guideAgreed : userAgreed;
  const otherPartyAgreed = isGuide ? userAgreed : guideAgreed;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Agreement & Commitment</h3>
          <p className="text-sm text-gray-600">
            Both parties must agree to the final terms before proceeding to booking.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Status */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            userAgreed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            {userAgreed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-medium">Traveller</div>
              <div className="text-sm text-gray-600">
                {userAgreed ? (
                  <>
                    ✅ Agreed
                    {agreement?.userAgreedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(agreement.userAgreedAt).toLocaleString()}
                      </div>
                    )}
                  </>
                ) : (
                  '⏳ Pending agreement'
                )}
              </div>
            </div>
          </div>

          {/* Guide Status */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            guideAgreed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            {guideAgreed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-medium">Tour Guide</div>
              <div className="text-sm text-gray-600">
                {guideAgreed ? (
                  <>
                    ✅ Agreed
                    {agreement?.guideAgreedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(agreement.guideAgreedAt).toLocaleString()}
                      </div>
                    )}
                  </>
                ) : (
                  '⏳ Pending agreement'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Complete */}
        {bothAgreed && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Agreement Complete!</strong> Both parties have agreed to the terms. 
              You can now proceed to create the booking and payment.
            </AlertDescription>
          </Alert>
        )}

        {/* Terms Display (if agreed) */}
        {agreement?.terms && (hasAgreed || bothAgreed) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-blue-900">Agreed Terms</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Final Price:</span>
                <span className="font-semibold">
                  {agreement.terms.finalPrice?.toLocaleString('vi-VN')} {agreement.terms.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Guests:</span>
                <span className="font-semibold">{agreement.terms.numberOfGuests} {agreement.terms.numberOfGuests > 1 ? 'people' : 'person'}</span>
              </div>
              {agreement.terms.specialConditions && (
                <div>
                  <span className="text-gray-600">Special Conditions:</span>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                    {agreement.terms.specialConditions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!bothAgreed && (
          <div>
            {!hasAgreed ? (
              // Show agree button/form
              <>
                {!showTermsForm ? (
                  <div className="space-y-3">
                    {otherPartyAgreed && (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          The other party has agreed to the terms. Please review and confirm your agreement.
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button
                      onClick={() => setShowTermsForm(true)}
                      className="w-full"
                      size="lg"
                    >
                      Review and Agree to Terms
                    </Button>
                  </div>
                ) : (
                  // Terms form
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Confirm Agreement Terms</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="finalPrice">Final Price *</Label>
                        <Input
                          id="finalPrice"
                          type="number"
                          value={terms.finalPrice}
                          onChange={(e) => setTerms(prev => ({
                            ...prev,
                            finalPrice: Number(e.target.value)
                          }))}
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          value={terms.currency}
                          onChange={(e) => setTerms(prev => ({
                            ...prev,
                            currency: e.target.value
                          }))}
                          className="w-full h-10 px-3 border rounded-md"
                        >
                          <option value="VND">VND</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="numberOfGuests">Number of Guests * (Max 10)</Label>
                        <Input
                          id="numberOfGuests"
                          type="number"
                          value={terms.numberOfGuests}
                          onChange={(e) => setTerms(prev => ({
                            ...prev,
                            numberOfGuests: Number(e.target.value)
                          }))}
                          min="1"
                          max="10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="specialConditions">Special Conditions (Optional)</Label>
                      <Textarea
                        id="specialConditions"
                        value={terms.specialConditions}
                        onChange={(e) => setTerms(prev => ({
                          ...prev,
                          specialConditions: e.target.value
                        }))}
                        placeholder="Any special conditions or notes..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleAgree}
                        disabled={agreeing}
                        className="flex-1"
                        size="lg"
                      >
                        {agreeing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm Agreement
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowTermsForm(false)}
                        variant="outline"
                        disabled={agreeing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Already agreed, waiting for other party
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  You have agreed to the terms. Waiting for {isGuide ? 'traveller' : 'tour guide'} to confirm.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 border-t pt-4">
          <p>
            ⚠️ <strong>Important:</strong> Both parties must agree to the same terms before the booking can be created.
            The agreement is binding and should reflect the final negotiated price and conditions.
          </p>
        </div>
      </div>
    </Card>
  );
}
