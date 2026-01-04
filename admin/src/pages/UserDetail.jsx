import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { dataService } from '../services/data';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const data = await dataService.getUser(id);
      setUser(data.user);
      setWithdrawals(data.withdrawals);
    } catch (error) {
      message.error('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  const withdrawalColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount} HERO`,
    },
    {
      title: 'Wallet Address',
      dataIndex: 'wallet_address',
      key: 'wallet_address',
      render: (addr) => <code>{addr}</code>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          completed: 'green',
          rejected: 'red',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/users')}
        style={{ marginBottom: 16 }}
      >
        Back to Users
      </Button>
      <Card title="User Details">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{user?.id}</Descriptions.Item>
          <Descriptions.Item label="Telegram ID">{user?.telegram_id}</Descriptions.Item>
          <Descriptions.Item label="Username">
            {user?.telegram_username || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Language">
            <Tag>{user?.language?.toUpperCase() || 'VI'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Balance">
            {user?.balance || 0} HERO
          </Descriptions.Item>
          <Descriptions.Item label="Referral Code">
            <code>{user?.referral_code}</code>
          </Descriptions.Item>
          <Descriptions.Item label="Referred By">
            {user?.referred_by_username || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(user?.created_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="Withdrawals" style={{ marginTop: 16 }}>
        <Table
          columns={withdrawalColumns}
          dataSource={withdrawals}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
}

