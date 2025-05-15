import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';

export default function ClientContracts() {
  const { user, isLoading: authLoading } = useAuth0();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const fetchContracts = async () => {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .eq('client_id', user.sub);

        if (error) {
          console.error('Error fetching contracts:', error);
        } else {
          setContracts(data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <p>Loading your contracts…</p>;
  }

  return (
    <section className="client-contracts">
      <h1>Your Contracts</h1>
      {contracts.length === 0 ? (
        <p>No contracts found.</p>
      ) : (
        <ul>
          {contracts.map((c) => (
            <li key={c.id}>
              <strong>{c.title}</strong><br />
              Status: {c.status}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}