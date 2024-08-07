import React, { useState, memo, useEffect, useCallback } from 'react';
import { REQUEST_URL, headers } from './constants';
import deleteIcon from './delete.svg';
import './todo.css';

const AddTodo = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [todos, setTodos] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(REQUEST_URL, {
                    method: 'GET',
                    headers,
                });
                if (!response.ok) {
                    throw new Error('Unable to fetch todos');
                }
                const { data } = await response.json();
                setTodos(data.todos);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }; 
        fetchTodos();
    }, [])

    const onTitleChange = useCallback(({ target: { value } }) => {
        setTitle(value);
    }, []);

    const onDescriptionChange = useCallback(({ target: { value } }) => {
        setDescription(value);
    }, []);

    const handleAdd = useCallback(async () => {
        setError('');
        
        if (!title || !description) {
            setError('Title and description are required');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(REQUEST_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify({ title, description })
            });

            if (!response.ok) {
                throw new Error('Unable to add todo');
            }
            const { data: { todo } } = await response.json();
            setTodos([ todo, ...todos ]);
        } catch (err) {
            setError('Failed to add todo');
        } finally {
            setIsLoading(false);
        }
        setDescription('');
        setTitle('');
    }, [description, title, todos]);

    const onDelete = useCallback((id) => async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${REQUEST_URL}/${id}`, {
                method: 'DELETE',
                headers,
            });
            const result = await response.json();
            if (!response.status === 'success') {
                throw new Error(result.message);
            }
            setTodos([...todos.filter(({ id: todoId }) => todoId !== id )]);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [todos]);

    return (
        <>
            <h2>Add Todo</h2>
            {error && <p className='error'>{error}</p>}

            <div className="todo-input-container">
                <div className="input-group">
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={onTitleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Description</label>
                    <input
                        value={description}
                        onChange={onDescriptionChange}
                        required
                    />
                </div>
                <button onClick={handleAdd}>Add Todo</button>
            </div>
            <div className='todos-container'>
                {!todos.length && <p>There are no todos yet...</p>}
                {todos.length ? todos.map(({ id, title, description }) => {
                    return (
                        <div className='todo-item' key={id}>
                            <div>
                                <b>{title}</b>
                                <p>{description}</p>
                            </div>
                            <img src={deleteIcon} alt="delete-todo" onClick={onDelete(id)} />
                        </div>
                    )
                }) : null}
            </div>
            {isLoading && <div className='loader'><p>Loading...</p></div>}
        </>
    );
};

export default memo(AddTodo);
