import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}! 👋</h1>
        <p className="text-gray-600 mt-2">Here's your wellness overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Quick Check-in</h3>
          <p className="text-gray-600 mt-2">Track your mood today</p>
          <button className="btn-primary mt-4 w-full">Check-in Now</button>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Study Session</h3>
          <p className="text-gray-600 mt-2">Start a focused study session</p>
          <button className="btn-primary mt-4 w-full">Start Session</button>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
          <p className="text-gray-600 mt-2">Wellness resources & support</p>
          <button className="btn-secondary mt-4 w-full">Browse</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
        <ul className="space-y-2 text-gray-600">
          <li>✅ Mood tracking dashboard</li>
          <li>✅ Study session timer</li>
          <li>✅ Wellness analytics</li>
          <li>✅ Resource library</li>
        </ul>
      </div>
    </div>
  );
}
