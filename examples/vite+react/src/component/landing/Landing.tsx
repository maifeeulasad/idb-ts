import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Modal, Input, notification } from 'antd';
import { DataClass, KeyPath } from 'idb-ts/lib';

import useIDBOperations from '../../hook/useIDBOperations';

const Context = React.createContext({ name: 'Default' });

@DataClass()
class User {
  @KeyPath()
  name: string;
  age: number;
  cell?: string;
  address: string;

  constructor(name: string, age: number, address: string, cell?: string) {
    this.name = name;
    this.age = age;
    this.address = address;
    this.cell = cell;
  }
}

@DataClass()
class Location {
  @KeyPath()
  id: string;
  city: string;
  country: string;

  constructor(id: string, city: string, country: string) {
    this.id = id;
    this.city = city;
    this.country = country;
  }
}

const Landing = () => {
  const [api, contextHolder] = notification.useNotification();
  const contextValue = useMemo(() => ({ name: 'idb-ts example' }), []);


  const {
    db,
    loading,
    error,
    initializeDB,
    createItem,
    readItem,
    updateItem,
    deleteItem,
    listItems,
  } = useIDBOperations();

  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [newUser, setNewUser] = useState<User | null>(null);
  const [newLocation, setNewLocation] = useState<Location | null>(null);

  useEffect(() => {
    initializeDB("idb-crud-react", [User, Location]);
  }, []);

  useEffect(() => {
    if (db) {
      const fetchData = async () => {
        const usersList = await listItems(User);
        const locationsList = await listItems(Location);
        if (usersList) setUsers(usersList);
        if (locationsList) setLocations(locationsList);
      };
      fetchData();
    }
  }, [db]);

  const userColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Cell', dataIndex: 'cell', key: 'cell' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: User) => (
        <Space size="middle">
          <Button type='primary' onClick={() => { handleEditUser(record.name); setNewUser(record); }}>Edit</Button>
          <Button type='primary' onClick={() => handleDeleteUser(record.name)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const locationColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'Country', dataIndex: 'country', key: 'country' },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: Location) => (
        <Space size="middle">
          <Button type='primary' onClick={() => { handleEditLocation(record.id); setNewLocation(record); }}>Edit</Button>
          <Button type='primary' onClick={() => handleDeleteLocation(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const handleDeleteUser = async (name: string) => {
    await deleteItem(User, name);
    const updatedUsers = await listItems(User);
    if (updatedUsers) setUsers(updatedUsers);
  };

  const handleDeleteLocation = async (id: string) => {
    await deleteItem(Location, id);
    const updatedLocations = await listItems(Location);
    if (updatedLocations) setLocations(updatedLocations);
  };

  const handleEditUser = async (name: string) => {
    const user = await readItem(User, name);
    setSelectedUser(user || null);
    setIsUserModalVisible(true);
  };

  const handleEditLocation = async (id: string) => {
    const location = await readItem(Location, id);
    setSelectedLocation(location || null);
    setIsLocationModalVisible(true);
  };

  const handleAddUser = async () => {
    if (newUser) {
      if (selectedUser) {
        await updateItem(User, newUser);
      } else {
        await createItem(User, newUser);
      }
      const updatedUsers = await listItems(User);
      if (updatedUsers) setUsers(updatedUsers);
      setIsUserModalVisible(false);
      setNewUser(null);
      setSelectedUser(null);
    }
  };

  const handleAddLocation = async () => {
    if (newLocation) {
      if (selectedLocation) {
        await updateItem(Location, newLocation);
      } else {
        await createItem(Location, newLocation);
      }
      const updatedLocations = await listItems(Location);
      if (updatedLocations) setLocations(updatedLocations);
      setIsLocationModalVisible(false);
      setNewLocation(null);
      setSelectedLocation(null);
    }
  };

  useEffect(() => {
    if (error) {
      api.error({
        message: 'Error',
        description: error,
      });
    }
  }, [error]);

  return (
    <Context.Provider value={contextValue}>
      {contextHolder}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Users</h1>
          <Button type="primary" onClick={() => setIsUserModalVisible(true)}>Add User</Button>
        </div>
        <Table dataSource={users} columns={userColumns} rowKey="name" loading={loading} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Locations</h1>
          <Button type="primary" onClick={() => setIsLocationModalVisible(true)}>Add Location</Button>
        </div>
        <Table dataSource={locations} columns={locationColumns} rowKey="id" loading={loading} />

        {/* User Modal */}
        <Modal
          title={selectedUser ? "Edit User" : "Add User"}
          open={isUserModalVisible}
          onOk={handleAddUser}
          onCancel={() => {
            setIsUserModalVisible(false);
            setSelectedUser(null);
            setNewUser(null);
          }}
        >
          <Input placeholder="Name" value={newUser?.name || selectedUser?.name || ''} onChange={(e) => setNewUser({ ...newUser, name: e.target.value } as User)} />
          <Input placeholder="Age" type="number" value={newUser?.age || selectedUser?.age || ''} onChange={(e) => setNewUser({ ...newUser, age: parseInt(e.target.value) } as User)} />
          <Input placeholder="Cell" value={newUser?.cell || selectedUser?.cell || ''} onChange={(e) => setNewUser({ ...newUser, cell: e.target.value } as User)} />
          <Input placeholder="Address" value={newUser?.address || selectedUser?.address || ''} onChange={(e) => setNewUser({ ...newUser, address: e.target.value } as User)} />
        </Modal>

        {/* Location Modal */}
        <Modal
          title={selectedLocation ? "Edit Location" : "Add Location"}
          open={isLocationModalVisible}
          onOk={handleAddLocation}
          onCancel={() => {
            setIsLocationModalVisible(false);
            setSelectedLocation(null);
            setNewLocation(null);
          }}
        >
          <Input placeholder="ID" value={newLocation?.id || selectedLocation?.id || ''} onChange={(e) => setNewLocation({ ...newLocation, id: e.target.value } as Location)} />
          <Input placeholder="City" value={newLocation?.city || selectedLocation?.city || ''} onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value } as Location)} />
          <Input placeholder="Country" value={newLocation?.country || selectedLocation?.country || ''} onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value } as Location)} />
        </Modal>

        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
    </Context.Provider>
  );
};

export default Landing;
