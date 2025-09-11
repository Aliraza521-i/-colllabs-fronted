import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Mock data for now
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTickets([
        {
          id: 1,
          subject: 'Issue with website verification',
          user: 'John Doe',
          email: 'john@example.com',
          status: 'open',
          priority: 'high',
          createdAt: '2023-05-15T10:30:00Z',
          lastUpdated: '2023-05-15T14:22:00Z'
        },
        {
          id: 2,
          subject: 'Payment not received',
          user: 'Jane Smith',
          email: 'jane@example.com',
          status: 'closed',
          priority: 'medium',
          createdAt: '2023-05-14T09:15:00Z',
          lastUpdated: '2023-05-15T16:45:00Z'
        },
        {
          id: 3,
          subject: 'Question about pricing',
          user: 'Bob Johnson',
          email: 'bob@example.com',
          status: 'pending',
          priority: 'low',
          createdAt: '2023-05-16T11:20:00Z',
          lastUpdated: '2023-05-16T11:20:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      open: { class: 'bg-red-100 text-red-800', text: 'Open' },
      closed: { class: 'bg-green-100 text-green-800', text: 'Closed' },
      pending: { class: 'bg-yellow-100 text-yellow-800', text: 'Pending' }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { class: 'bg-gray-100 text-gray-800', text: 'Low' },
      medium: { class: 'bg-yellow-100 text-yellow-800', text: 'Medium' },
      high: { class: 'bg-red-100 text-red-800', text: 'High' }
    };

    const badge = badges[priority] || badges.low;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Support Tickets</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                  <div className="text-sm text-gray-500">{ticket.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    {ticket.user}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(ticket.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(ticket.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.lastUpdated).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    View
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTickets.length === 0 && !loading && (
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "There are no support tickets at the moment." 
              : `There are no ${filter} tickets at the moment.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;