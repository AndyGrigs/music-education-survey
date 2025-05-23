import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabaseUrl = import.meta.env.VITE_API_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_API_SUPABASE_ANON;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [kidsData, setKidsData] = useState({});

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from('kidsData')
        .select('*');
      if (error) {
        console.error('Error loading data:', error.message);
        return;
      }
      const map = {};
      data.forEach(record => { map[record.id] = record });
      setKidsData(map);
    }
    loadData();

    const subscription = supabase
      .channel('public:kidsData')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kidsData' }, payload => {
        setKidsData(prev => ({ ...prev, [payload.new.id]: payload.new }));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kidsData' }, payload => {
        setKidsData(prev => ({ ...prev, [payload.new.id]: payload.new }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleChange = (id, field, value) => {
    const updated = { ...kidsData[id], [field]: value };
    setKidsData(prev => ({ ...prev, [id]: updated }));

    supabase
      .from('kidsData')
      .upsert({ id, checked: updated.checked, notes: updated.notes })
      .then(({ error }) => {
        if (error) console.error('Upsert error:', error.message);
      });
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '2rem auto' }}>
      <h1>Список дітей</h1>
      {Object.keys(kidsData).length === 0
        ? <p>Завантаження або немає даних...</p>
        : Object.values(kidsData).map(kid => (
            <div
              key={kid.id}
              style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: 4 }}
            >
              <h3 style={{ margin: '0 0 .5rem' }}>{kid.name}</h3>
              <label>
                <input
                  type="checkbox"
                  checked={!!kid.checked}
                  onChange={e => handleChange(kid.id, 'checked', e.target.checked)}
                />{' '}
                Виконано
              </label>
              <textarea
                style={{ width: '100%', height: '4rem', marginTop: '.5rem' }}
                placeholder="Ваші нотатки…"
                value={kid.notes || ''}
                onChange={e => handleChange(kid.id, 'notes', e.target.value)}
              />
            </div>
          ))}
    </div>
  );
}
