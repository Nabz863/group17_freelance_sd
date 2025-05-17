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
      const query = searchQuery.trim().toLowerCase();

      try {
        console.log('Searching for:', query);

        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('profile')
          .limit(10);

        const { data: freelancers, error: freelancerError } = await supabase
          .from('freelancers')
          .select('profile')
          .limit(10);

        console.log('Raw clients:', clients);
        console.log('Raw freelancers:', freelancers);

        if (clientError || freelancerError) {
          console.error('Supabase error:', clientError || freelancerError);
          throw clientError || freelancerError;
        }

        const parseProfile = (user) => {
          let profile = user.profile;
          if (typeof profile === 'string') {
            try {
              profile = JSON.parse(profile);
            } catch (err) {
              console.error("Failed to parse profile JSON:", user.profile);
              return null;
            }
          }
          return profile;
        };

        const filteredClients = (clients || []).filter(client => {
          const profile = parseProfile(client);
          const match = profile?.firstName?.toLowerCase().includes(query);
          console.log(`Client: ${profile?.firstName}, match: ${match}`);
          return match;
        });

        const filteredFreelancers = (freelancers || []).filter(freelancer => {
          const profile = parseProfile(freelancer);
          const match = profile?.firstName?.toLowerCase().includes(query);
          console.log(`Freelancer: ${profile?.firstName}, match: ${match}`);
          return match;
        });

        const combinedResults = [...filteredClients, ...filteredFreelancers].map(user => {
          const profile = parseProfile(user);
          return {
            name: profile.firstName
          };
        });

        console.log("Combined search results:", combinedResults);
        setSearchResults(combinedResults);
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
        placeholder="Search by name..."
        className="w-full px-3 py-2 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
      />
      {searchQuery && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-auto z-10">
          {isLoading ? (
            <div className="p-4 text-center">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center">No users found</div>
          ) : (
            searchResults.map((user, index) => (
              <div
                key={`${user.name}-${index}`}
                onClick={() => handleSelectUser(user)}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                <div className="font-semibold">{user.name}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}