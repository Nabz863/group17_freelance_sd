import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function UserSearch({ onSelectUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      try {
        console.log('Searching for:', searchQuery);
        
        // Search clients table
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('user_id, email, profile')
          .like('email', `%${searchQuery}%`)
          .or(`profile->>firstName like '%${searchQuery}%'`)
          .limit(5);

        // Search freelancers table
        const { data: freelancers, error: freelancerError } = await supabase
          .from('freelancers')
          .select('user_id, email, profile')
          .like('email', `%${searchQuery}%`)
          .or(`profile->>firstName like '%${searchQuery}%'`)
          .limit(5);

        if (clientError || freelancerError) {
          console.error('Error searching users:', clientError || freelancerError);
          console.error('Clients error:', clientError);
          console.error('Freelancers error:', freelancerError);
          throw clientError || freelancerError;
        }

        console.log('Clients found:', clients);
        console.log('Freelancers found:', freelancers);

        // Combine and format results
        const results = [...(clients || []), ...(freelancers || [])]
          .map(user => ({
            id: user.user_id,
            email: user.email,
            name: `${user.profile?.firstName} ${user.profile?.lastName}`.trim() || user.email.split('@')[0],
            role: 'freelancers' in user ? 'Freelancer' : 'Client'
          }));

        console.log('Formatted results:', results);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by email or name..."
        className="w-full px-3 py-2 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
      />
      {searchQuery && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-auto z-10">
          {isLoading ? (
            <div className="p-4 text-center">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center">No users found</div>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
