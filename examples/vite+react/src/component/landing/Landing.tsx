import React from 'react';
import { Table, Button, Space, Modal, Input } from 'antd';
import { useEffect, useState } from 'react';
import { Database, DataClass, KeyPath } from 'idb-ts/lib';

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
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [db, setDb] = useState<Database | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    const initDb = async () => {
      const database = await Database.build("idb-crud", [User, Location]);
      setDb(database);
      const usersList = await database.list(User);
      setUsers(usersList);
      const locationsList = await database.list(Location);
      setLocations(locationsList);
    };
    initDb();
  }, []);

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
          <Button onClick={() => handleEditUser(record.name)}>Edit</Button>
          <Button onClick={() => handleDeleteUser(record.name)}>Delete</Button>
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
          <Button onClick={() => handleEditLocation(record.id)}>Edit</Button>
          <Button onClick={() => handleDeleteLocation(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const handleDeleteUser = async (name: string) => {
    if (db) {
      await db.delete(User, name);
      const updatedUsers = await db.list(User);
      setUsers(updatedUsers);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (db) {
      await db.delete(Location, id);
      const updatedLocations = await db.list(Location);
      setLocations(updatedLocations);
    }
  };

  const handleEditUser = async (name: string) => {
    if (db) {
      const user = await db.read(User, name);
      setSelectedUser(user || null);
      setIsUserModalVisible(true);
    }
  };

  const handleEditLocation = async (id: string) => {
    if (db) {
      const location = await db.read(Location, id);
      setSelectedLocation(location || null);
      setIsLocationModalVisible(true);
    }
  };

  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [newUser, setNewUser] = useState<User | null>(null);
  const [newLocation, setNewLocation] = useState<Location | null>(null);

  const handleAddUser = async () => {
    if (db && newUser) {
      if (selectedUser) {
        await db.update(User, newUser);
      } else {
        await db.create(User, newUser);
      }
      const updatedUsers = await db.list(User);
      setUsers(updatedUsers);
      setIsUserModalVisible(false);
      setNewUser(null);
      setSelectedUser(null);
    }
  };

  const handleAddLocation = async () => {
    if (db && newLocation) {
      if (selectedLocation) {
        await db.update(Location, newLocation);
      } else {
        await db.create(Location, newLocation);
      }
      const updatedLocations = await db.list(Location);
      setLocations(updatedLocations);
      setIsLocationModalVisible(false);
      setNewLocation(null);
      setSelectedLocation(null);
    }
  };

  return (
    <div>
      <h1>Users</h1>
      <Button type="primary" onClick={() => setIsUserModalVisible(true)}>Add User</Button>
      <Table dataSource={users} columns={userColumns} rowKey="name" />
      <h1>Locations</h1>
      <Button type="primary" onClick={() => setIsLocationModalVisible(true)}>Add Location</Button>
      <Table dataSource={locations} columns={locationColumns} rowKey="id" />

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
    </div>
  );
};

export default Landing;