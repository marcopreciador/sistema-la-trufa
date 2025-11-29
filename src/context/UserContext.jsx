import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export function useUsers() {
    return useContext(UserContext);
}

const DEFAULT_USERS = [
    { id: 1, name: 'Marco', role: 'Admin', pin: '1234' },
    { id: 2, name: 'Diana', role: 'Admin', pin: '1234' }
];

export function UserProvider({ children }) {
    const [users, setUsers] = useState(() => {
        const savedUsers = localStorage.getItem('la-trufa-users');
        let parsedUsers = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;

        // Emergency Reset / Auto-Fix for Marco
        parsedUsers = parsedUsers.map(u => {
            if (u.name === 'Marco') {
                return { ...u, pin: '1234' };
            }
            return u;
        });

        return parsedUsers;
    });

    const [currentUser, setCurrentUser] = useState(() => {
        // For security, we might NOT want to persist the session across reloads, 
        // but for a POS it's often convenient. 
        // User requested "Bloquear Pantalla" which implies session persistence until explicit lock.
        const savedCurrent = localStorage.getItem('la-trufa-current-user');
        return savedCurrent ? JSON.parse(savedCurrent) : null;
    });

    useEffect(() => {
        localStorage.setItem('la-trufa-users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('la-trufa-current-user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('la-trufa-current-user');
        }
    }, [currentUser]);

    const addUser = (user) => {
        const newUser = { ...user, id: Date.now() };
        setUsers([...users, newUser]);
    };

    const updateUser = (updatedUser) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const deleteUser = (id) => {
        if (users.length <= 1) {
            alert('Debe haber al menos un usuario.');
            return;
        }
        setUsers(users.filter(u => u.id !== id));
    };

    const login = (userId, pin) => {
        const user = users.find(u => u.id === userId);
        if (user && user.pin === pin) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <UserContext.Provider value={{
            users,
            currentUser,
            addUser,
            updateUser,
            deleteUser,
            login,
            logout
        }}>
            {children}
        </UserContext.Provider>
    );
}
