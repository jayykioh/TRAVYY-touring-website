import { useState, useContext } from 'react';
import { AuthCtx } from '../auth/context';

const PromoCodeInput = ({ totalAmount, onApply }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { withAuth } = useContext(AuthCtx);

  const handleApply = async () => {
    if (!code.trim()) return;

    try {
      setLoading(true);
      setError('');
      
      const data = withAuth
        ? await withAuth('/api/promotions/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: code.toUpperCase(),
              totalAmount
            })
          })
        : await fetch('/api/promotions/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: code.toUpperCase(),
              totalAmount
            })
          }).then(r => r.json());

      if (data.valid) {
        setResult(data);
        onApply(data);
      } else {
        setError(data.message);
        setResult(null);
        onApply(null);
      }
    } catch (error) {
      console.error('❌ PromoCodeInput: Validate error:', error);
      setError(error.message || 'Có lỗi xảy ra');
      setResult(null);
      onApply(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setResult(null);
    setError('');
    onApply(null);
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-3">🎁 Mã giảm giá</h3>

      {!result ? (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá"
              className="flex-1 px-4 py-2 border rounded-lg uppercase"
            />
            <button
              onClick={handleApply}
              disabled={loading || !code}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Đang kiểm tra...' : 'Áp dụng'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-green-800">{result.promotion.code}</p>
              <p className="text-green-600 font-semibold">
                Giảm {result.discount.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <button onClick={handleRemove} className="text-red-600">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
