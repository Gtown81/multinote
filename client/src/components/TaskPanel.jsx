import { useState } from 'react';

export default function TaskPanel({ tasks, onCreate, onUpdate, onDelete }) {
  const [title, setTitle] = useState('');

  return (
    <section className="card">
      <h3>Tasks</h3>
      <div className="row">
        <input placeholder="Neue Task" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button
          onClick={() => {
            if (!title.trim()) return;
            onCreate({ title, priority: 'medium' });
            setTitle('');
          }}
        >
          Hinzufügen
        </button>
      </div>

      <div className="list">
        {tasks.map((task) => (
          <article className="item" key={task._id}>
            <div className="row between">
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => onUpdate(task._id, { completed: e.target.checked })}
                />{' '}
                {task.title}
              </label>
              <button className="danger" onClick={() => onDelete(task._id)}>
                Löschen
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
