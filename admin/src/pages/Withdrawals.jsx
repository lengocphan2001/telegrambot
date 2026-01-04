import { useEffect, useState } from 'react';
import { Table, Select, Tag, Button, Space, message, Modal, Descriptions } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { dataService } from '../services/data';

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [viewRecord, setViewRecord] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, [pagination.current, pagination.pageSize, statusFilter]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await dataService.getWithdrawals(
        pagination.current,
        pagination.pageSize,
        statusFilter
      );
      setWithdrawals(data.withdrawals);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch (error) {
      message.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await dataService.updateWithdrawalStatus(id, newStatus);
      message.success('Withdrawal status updated');
      loadWithdrawals();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <div>{record.telegram_username || `ID: ${record.telegram_id}`}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            Telegram ID: {record.telegram_id}
          </div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <strong>{amount} HERO</strong>,
    },
    {
      title: 'Wallet Address',
      dataIndex: 'wallet_address',
      key: 'wallet_address',
      render: (addr) => <code style={{ fontSize: 12 }}>{addr}</code>,
      width: 200,
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
      title: 'User Balance',
      dataIndex: 'user_balance',
      key: 'user_balance',
      render: (balance) => `${balance || 0} HERO`,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (record.status === 'pending') {
          return (
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleStatusChange(record.id, 'completed')}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => handleStatusChange(record.id, 'rejected')}
              >
                Reject
              </Button>
            </Space>
          );
        }
        // Show View Record button for completed or rejected withdrawals
        return (
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setViewRecord(record);
              setViewModalVisible(true);
            }}
          >
            View Record
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Withdrawals</h1>
        <Select
          placeholder="Filter by status"
          style={{ width: 200 }}
          allowClear
          value={statusFilter || undefined}
          onChange={(value) => {
            setStatusFilter(value || '');
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
        >
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="completed">Completed</Select.Option>
          <Select.Option value="rejected">Rejected</Select.Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={withdrawals}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1400 }}
      />

      {/* View Record Modal */}
      <Modal
        title="Withdrawal Record Details"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setViewRecord(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setViewRecord(null);
          }}>
            Close
          </Button>
        ]}
        width={700}
      >
        {viewRecord && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Withdrawal ID">
              <strong>{viewRecord.id}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="User">
              <div>
                <div><strong>Username:</strong> {viewRecord.telegram_username || 'N/A'}</div>
                <div><strong>Telegram ID:</strong> {viewRecord.telegram_id}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <strong style={{ fontSize: 16, color: '#1890ff' }}>
                {viewRecord.amount} HERO
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Wallet Address">
              <code style={{ fontSize: 12, wordBreak: 'break-all' }}>
                {viewRecord.wallet_address}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  viewRecord.status === 'completed'
                    ? 'green'
                    : viewRecord.status === 'rejected'
                    ? 'red'
                    : 'orange'
                }
                style={{ fontSize: 12 }}
              >
                {viewRecord.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="User Balance (at time of request)">
              {viewRecord.user_balance || 0} HERO
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(viewRecord.created_at).toLocaleString()}
            </Descriptions.Item>
            {viewRecord.updated_at && (
              <Descriptions.Item label="Updated At">
                {new Date(viewRecord.updated_at).toLocaleString()}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

