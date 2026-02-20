
import React, { useState, useEffect } from 'react';
import {
    FaUserShield, FaPlaneDeparture, FaClipboardList, FaFileInvoiceDollar,
    FaUsers, FaChartLine, FaHistory, FaSearch, FaBell, FaSignOutAlt,
    FaArrowLeft, FaPlus, FaSave, FaTimes, FaCheck, FaExclamationTriangle,
    FaCalendarAlt, FaMoneyBillWave, FaPaperclip, FaGlobe, FaTag, FaTasks,
    FaBriefcase, FaUserTie, FaDollarSign, FaFileContract, FaRegLightbulb
} from 'react-icons/fa';

// Utility to generate unique IDs
const generateId = (prefix = 'ID') => `${prefix}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// --- RBAC & Permissions ---
const USER_ROLES = {
    ADMIN: 'Admin',
    EMPLOYEE: 'Employee',
    MANAGER: 'Manager',
    FINANCE: 'Finance Team'
};

const PERMISSIONS = {
    // Dashboards
    DASHBOARD_ADMIN: [USER_ROLES.ADMIN],
    DASHBOARD_EMPLOYEE: [USER_ROLES.EMPLOYEE],
    DASHBOARD_MANAGER: [USER_ROLES.MANAGER],
    DASHBOARD_FINANCE: [USER_ROLES.FINANCE],

    // Travel Requests
    VIEW_TRAVEL_REQUESTS_ALL: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.FINANCE],
    VIEW_TRAVEL_REQUESTS_OWN: [USER_ROLES.EMPLOYEE],
    CREATE_TRAVEL_REQUEST: [USER_ROLES.EMPLOYEE],
    EDIT_TRAVEL_REQUEST_DRAFT: [USER_ROLES.EMPLOYEE],
    APPROVE_TRAVEL_REQUEST: [USER_ROLES.MANAGER, USER_ROLES.FINANCE],
    REJECT_TRAVEL_REQUEST: [USER_ROLES.MANAGER, USER_ROLES.FINANCE],
    VIEW_TRAVEL_WORKFLOW: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE, USER_ROLES.MANAGER, USER_ROLES.FINANCE],

    // Expenses
    VIEW_EXPENSES_ALL: [USER_ROLES.ADMIN, USER_ROLES.FINANCE],
    VIEW_EXPENSES_TEAM: [USER_ROLES.MANAGER],
    VIEW_EXPENSES_OWN: [USER_ROLES.EMPLOYEE],
    CREATE_EXPENSE: [USER_ROLES.EMPLOYEE],
    EDIT_EXPENSE_DRAFT: [USER_ROLES.EMPLOYEE],
    APPROVE_EXPENSE: [USER_ROLES.MANAGER, USER_ROLES.FINANCE],
    REJECT_EXPENSE: [USER_ROLES.MANAGER, USER_ROLES.FINANCE],

    // User Management
    MANAGE_USERS: [USER_ROLES.ADMIN],

    // Audit Logs
    VIEW_AUDIT_LOGS: [USER_ROLES.ADMIN, USER_ROLES.FINANCE],

    // General
    GLOBAL_SEARCH: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE, USER_ROLES.MANAGER, USER_ROLES.FINANCE],
    EXPORT_DATA: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.FINANCE],
};

const STATUS_COLOR_MAP = {
    APPROVED: 'green',
    COMPLETED: 'green',
    REIMBURSED: 'green',
    IN_PROGRESS: 'blue',
    BOOKED: 'blue',
    PENDING_MANAGER_APPROVAL: 'orange',
    PENDING_FINANCE_REVIEW: 'orange',
    ACTION_REQUIRED: 'orange',
    REJECTED: 'red',
    SLA_BREACHED: 'red',
    BLOCKED: 'red',
    ESCALATED: 'purple',
    EXCEPTION: 'purple',
    DRAFT: 'grey',
    ARCHIVED: 'grey',
    PENDING_SUBMISSION: 'grey',
};

const getStatusColor = (status) => STATUS_COLOR_MAP[status] || 'grey';

// --- Dummy Data ---
const dummyUsers = [
    { id: 'U001', name: 'Alice Admin', email: 'alice.a@traveldesk.com', role: USER_ROLES.ADMIN, department: 'IT' },
    { id: 'U002', name: 'Bob Employee', email: 'bob.e@traveldesk.com', role: USER_ROLES.EMPLOYEE, department: 'Sales' },
    { id: 'U003', name: 'Charlie Manager', email: 'charlie.m@traveldesk.com', role: USER_ROLES.MANAGER, department: 'Sales' },
    { id: 'U004', name: 'Diana Finance', email: 'diana.f@traveldesk.com', role: USER_ROLES.FINANCE, department: 'Finance' },
    { id: 'U005', name: 'Eve Employee', email: 'eve.e@traveldesk.com', role: USER_ROLES.EMPLOYEE, department: 'Marketing' },
    { id: 'U006', name: 'Frank Manager', email: 'frank.m@traveldesk.com', role: USER_ROLES.MANAGER, department: 'Marketing' },
];

const dummyTravelRequests = [
    {
        id: 'TR001',
        title: 'Sales Conference - NYC',
        employeeId: 'U002',
        employeeName: 'Bob Employee',
        destination: 'New York, USA',
        startDate: '2023-11-15',
        endDate: '2023-11-18',
        estimatedCost: 2500,
        status: 'PENDING_MANAGER_APPROVAL',
        submittedDate: '2023-10-20',
        attachments: [{ name: 'Conference Agenda.pdf', url: '#' }],
        purpose: 'Attend annual sales conference to explore new market strategies.',
        workflow: [
            { stage: 'DRAFT', by: 'U002', date: '2023-10-19' },
            { stage: 'PENDING_MANAGER_APPROVAL', by: 'U002', date: '2023-10-20' }
        ],
        slaStatus: 'ON_TRACK',
        managerId: 'U003',
        financeId: null,
    },
    {
        id: 'TR002',
        title: 'Client Visit - London',
        employeeId: 'U005',
        employeeName: 'Eve Employee',
        destination: 'London, UK',
        startDate: '2023-12-01',
        endDate: '2023-12-05',
        estimatedCost: 3800,
        status: 'APPROVED',
        submittedDate: '2023-10-15',
        attachments: [{ name: 'Client Brief.docx', url: '#' }],
        purpose: 'Meet with key client stakeholders for Q4 review and planning.',
        workflow: [
            { stage: 'DRAFT', by: 'U005', date: '2023-10-14' },
            { stage: 'PENDING_MANAGER_APPROVAL', by: 'U005', date: '2023-10-15' },
            { stage: 'APPROVED', by: 'U006', date: '2023-10-16' },
            { stage: 'BOOKED', by: 'System', date: '2023-10-18' }
        ],
        slaStatus: 'COMPLETED',
        managerId: 'U006',
        financeId: null,
    },
    {
        id: 'TR003',
        title: 'Project Kickoff - Berlin',
        employeeId: 'U002',
        employeeName: 'Bob Employee',
        destination: 'Berlin, Germany',
        startDate: '2024-01-10',
        endDate: '2024-01-14',
        estimatedCost: 1800,
        status: 'PENDING_FINANCE_REVIEW',
        submittedDate: '2023-10-25',
        attachments: [{ name: 'Project Proposal.pdf', url: '#' }],
        purpose: 'Kickoff meeting for new international project.',
        workflow: [
            { stage: 'DRAFT', by: 'U002', date: '2023-10-24' },
            { stage: 'PENDING_MANAGER_APPROVAL', by: 'U002', date: '2023-10-25' },
            { stage: 'APPROVED_BY_MANAGER', by: 'U003', date: '2023-10-26' },
            { stage: 'PENDING_FINANCE_REVIEW', by: 'U003', date: '2023-10-26' }
        ],
        slaStatus: 'ON_TRACK',
        managerId: 'U003',
        financeId: 'U004',
    },
    {
        id: 'TR004',
        title: 'Training Workshop - Local',
        employeeId: 'U005',
        employeeName: 'Eve Employee',
        destination: 'Local Office',
        startDate: '2023-11-20',
        endDate: '2023-11-21',
        estimatedCost: 500,
        status: 'REJECTED',
        submittedDate: '2023-10-01',
        attachments: [],
        purpose: 'Internal training workshop on new software.',
        workflow: [
            { stage: 'DRAFT', by: 'U005', date: '2023-09-30' },
            { stage: 'PENDING_MANAGER_APPROVAL', by: 'U005', date: '2023-10-01' },
            { stage: 'REJECTED', by: 'U006', date: '2023-10-02', reason: 'Not budget aligned for this quarter.' }
        ],
        slaStatus: 'COMPLETED',
        managerId: 'U006',
        financeId: null,
    },
    {
        id: 'TR005',
        title: 'Vendor Negotiation - Dubai',
        employeeId: 'U003',
        employeeName: 'Charlie Manager',
        destination: 'Dubai, UAE',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        estimatedCost: 6000,
        status: 'PENDING_MANAGER_APPROVAL', // Charlie is also an employee in this case
        submittedDate: '2023-10-28',
        attachments: [{ name: 'Vendor Contract Draft.pdf', url: '#' }],
        purpose: 'Lead negotiation for new strategic vendor partnership.',
        workflow: [
            { stage: 'DRAFT', by: 'U003', date: '2023-10-27' },
            { stage: 'PENDING_MANAGER_APPROVAL', by: 'U003', date: '2023-10-28' }
        ],
        slaStatus: 'ON_TRACK',
        managerId: 'U001', // Admin acts as his manager
        financeId: null,
    }
];

const dummyExpenses = [
    {
        id: 'EXP001',
        title: 'Lunch with Client - TR002',
        employeeId: 'U005',
        employeeName: 'Eve Employee',
        amount: 85.50,
        currency: 'GBP',
        date: '2023-12-02',
        status: 'PENDING_MANAGER_APPROVAL',
        submittedDate: '2023-12-03',
        attachments: [{ name: 'Lunch Receipt.jpg', url: '#' }],
        relatedTravelRequest: 'TR002',
        managerId: 'U006',
        financeId: null,
    },
    {
        id: 'EXP002',
        title: 'Taxi to Airport - TR002',
        employeeId: 'U005',
        employeeName: 'Eve Employee',
        amount: 45.00,
        currency: 'GBP',
        date: '2023-12-01',
        status: 'APPROVED',
        submittedDate: '2023-12-03',
        attachments: [{ name: 'Taxi Receipt.pdf', url: '#' }],
        relatedTravelRequest: 'TR002',
        workflow: [
            { stage: 'DRAFT', by: 'U005', date: '2023-12-01' },
            { stage: 'PENDING_MANAGER_APPROVAL', by: 'U005', date: '2023-12-03' },
            { stage: 'APPROVED_BY_MANAGER', by: 'U006', date: '2023-12-04' },
            { stage: 'PENDING_FINANCE_APPROVAL', by: 'U006', date: '2023-12-04' },
            { stage: 'APPROVED', by: 'U004', date: '2023-12-05' },
            { stage: 'PROCESSED', by: 'U004', date: '2023-12-06' },
            { stage: 'REIMBURSED', by: 'System', date: '2023-12-07' },
        ],
        managerId: 'U006',
        financeId: 'U004',
    },
    {
        id: 'EXP003',
        title: 'Hotel Stay - NYC (TR001)',
        employeeId: 'U002',
        employeeName: 'Bob Employee',
        amount: 850.00,
        currency: 'USD',
        date: '2023-11-17',
        status: 'PENDING_FINANCE_APPROVAL',
        submittedDate: '2023-11-19',
        attachments: [{ name: 'Hotel Invoice.pdf', url: '#' }],
        relatedTravelRequest: 'TR001',
        workflow: [
            { stage: 'DRAFT', by: 'U002', date: '2023-11-18' },
            { stage: 'PENDING_MANAGER_APPROVAL', by: 'U002', date: '2023-11-19' },
            { stage: 'APPROVED_BY_MANAGER', by: 'U003', date: '2023-11-20' },
            { stage: 'PENDING_FINANCE_APPROVAL', by: 'U003', date: '2023-11-20' }
        ],
        managerId: 'U003',
        financeId: 'U004',
    },
    {
        id: 'EXP004',
        title: 'Taxi from Airport - NYC (TR001)',
        employeeId: 'U002',
        employeeName: 'Bob Employee',
        amount: 60.00,
        currency: 'USD',
        date: '2023-11-15',
        status: 'PENDING_MANAGER_APPROVAL',
        submittedDate: '2023-11-16',
        attachments: [{ name: 'Taxi Invoice.pdf', url: '#' }],
        relatedTravelRequest: 'TR001',
        managerId: 'U003',
        financeId: null,
    },
    {
        id: 'EXP005',
        title: 'Flight Ticket - TR002',
        employeeId: 'U005',
        employeeName: 'Eve Employee',
        amount: 550.00,
        currency: 'GBP',
        date: '2023-10-18',
        status: 'REIMBURSED',
        submittedDate: '2023-10-20',
        attachments: [{ name: 'Flight Receipt.pdf', url: '#' }],
        relatedTravelRequest: 'TR002',
        workflow: [
            { stage: 'DRAFT', by: 'U005', date: '2023-10-19' },
            { stage: 'PENDING_MANAGER_APPROVAL', by: 'U005', date: '2023-10-20' },
            { stage: 'APPROVED_BY_MANAGER', by: 'U006', date: '2023-10-21' },
            { stage: 'PENDING_FINANCE_APPROVAL', by: 'U006', date: '2023-10-21' },
            { stage: 'APPROVED', by: 'U004', date: '2023-10-22' },
            { stage: 'PROCESSED', by: 'U004', date: '2023-10-23' },
            { stage: 'REIMBURSED', by: 'System', date: '2023-10-24' },
        ],
        managerId: 'U006',
        financeId: 'U004',
    }
];

const dummyAuditLogs = [
    { id: 'AL001', timestamp: '2023-12-07 10:30:00', user: 'Diana Finance', action: 'Expense EXP002 reimbursed', entityType: 'Expense', entityId: 'EXP002' },
    { id: 'AL002', timestamp: '2023-12-05 15:20:00', user: 'Diana Finance', action: 'Expense EXP002 approved', entityType: 'Expense', entityId: 'EXP002' },
    { id: 'AL003', timestamp: '2023-11-20 09:00:00', user: 'Charlie Manager', action: 'Travel Request TR003 approved', entityType: 'TravelRequest', entityId: 'TR003' },
    { id: 'AL004', timestamp: '2023-11-19 11:45:00', user: 'Bob Employee', action: 'Expense EXP003 submitted', entityType: 'Expense', entityId: 'EXP003' },
    { id: 'AL005', timestamp: '2023-10-02 14:00:00', user: 'Frank Manager', action: 'Travel Request TR004 rejected', entityType: 'TravelRequest', entityId: 'TR004' },
];


// --- Helper Components ---
const Card = ({ title, description, status, onClick, children, headerRight, footerLeft, footerRight, typeIcon, typeLabel }) => (
    <div className="card" data-status={status} onClick={onClick}>
        <div className="card-header-accent">
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xxs)' }}>
                {typeIcon && <span className="icon">{typeIcon}</span>}
                {typeLabel || 'Record'}
            </span>
            <span className="status-badge" data-status={status}>{status.replace(/_/g, ' ')}</span>
        </div>
        <div className="card-content">
            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>
            <div className="card-footer">
                <span className="meta-item">{footerLeft}</span>
                <span className="meta-item">{footerRight}</span>
            </div>
            {children}
        </div>
    </div>
);

const StatusBadge = ({ status }) => (
    <span className="status-badge" data-status={status}>{status.replace(/_/g, ' ')}</span>
);

const WorkflowTracker = ({ workflow, currentStatus }) => {
    const stages = [
        { label: 'Draft', status: 'DRAFT' },
        { label: 'Manager Approval', status: 'PENDING_MANAGER_APPROVAL' },
        { label: 'Finance Review', status: 'PENDING_FINANCE_REVIEW' },
        { label: 'Approved', status: 'APPROVED' },
        { label: 'Booked / Processed', status: 'BOOKED' }, // For travel, 'Booked'. For expense, 'Processed'.
        { label: 'Completed', status: 'COMPLETED' },
        { label: 'Reimbursed', status: 'REIMBURSED' },
        { label: 'Rejected', status: 'REJECTED' },
    ];

    const currentStageIndex = stages.findIndex(s => s.status === currentStatus);

    return (
        <div className="workflow-tracker mb-lg">
            {stages.filter(s => s.status !== 'REJECTED').map((stage, index) => { // Filter out rejected for linear flow, show if actual status
                let stageClass = '';
                if (index <= currentStageIndex) {
                    stageClass = 'completed';
                }
                if (stage.status === currentStatus) {
                    stageClass = 'active';
                }
                if (currentStatus === 'SLA_BREACHED' && stage.status === stages[currentStageIndex - 1]?.status) { // if currentStatus is breached, highlight previous active stage as breached
                    stageClass += ' breached';
                }

                return (
                    <div key={stage.status} className={`workflow-stage ${stageClass}`}>
                        <div className="stage-dot"></div>
                        <div className="stage-label">{stage.label}</div>
                    </div>
                );
            })}
            {currentStatus === 'REJECTED' && (
                <div key="REJECTED" className="workflow-stage active">
                    <div className="stage-dot"></div>
                    <div className="stage-label">Rejected</div>
                </div>
            )}
        </div>
    );
};

const ChartPlaceholder = ({ title, type }) => (
    <div className="chart-container">
        <h3>{title}</h3>
        <div className="chart-placeholder">
            {type} Chart Placeholder
            <br />
            (Live Data with Pulse Animation)
        </div>
    </div>
);

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-close after 5 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    const icon = {
        success: <FaCheck />,
        error: <FaTimes />,
        info: <FaRegLightbulb />,
    }[type];

    return (
        <div className={`toast ${type}`}>
            {icon}
            <span>{message}</span>
        </div>
    );
};


// --- Form Components ---
const TravelRequestForm = ({ request, onSubmit, onCancel, readOnly, currentUser }) => {
    const isNew = !request.id;
    const initialStatus = isNew ? 'DRAFT' : request.status;
    const [formData, setFormData] = useState({
        ...request,
        status: initialStatus,
        employeeName: request.employeeName || currentUser.name,
        employeeId: request.employeeId || currentUser.id,
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), ...files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }))]
        }));
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.title) newErrors.title = 'Title is required.';
        if (!formData.destination) newErrors.destination = 'Destination is required.';
        if (!formData.startDate) newErrors.startDate = 'Start Date is required.';
        if (!formData.endDate) newErrors.endDate = 'End Date is required.';
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            newErrors.endDate = 'End Date cannot be before Start Date.';
        }
        if (!formData.estimatedCost || formData.estimatedCost <= 0) newErrors.estimatedCost = 'Estimated Cost must be a positive number.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (action) => {
        if (!validateForm()) return;

        let newStatus = formData.status;
        let workflowEntry = { stage: action, by: currentUser.id, date: new Date().toISOString().split('T')[0] };
        let reason = '';

        if (action === 'SUBMIT' && formData.status === 'DRAFT') {
            newStatus = 'PENDING_MANAGER_APPROVAL';
        } else if (action === 'APPROVE') {
            if (currentUser.role === USER_ROLES.MANAGER) {
                newStatus = formData.estimatedCost > 2000 ? 'PENDING_FINANCE_REVIEW' : 'APPROVED';
            } else if (currentUser.role === USER_ROLES.FINANCE) {
                newStatus = 'APPROVED';
            }
            workflowEntry.stage = newStatus === 'APPROVED' ? 'APPROVED' : 'APPROVED_BY_MANAGER';
        } else if (action === 'REJECT') {
            newStatus = 'REJECTED';
            reason = prompt('Reason for rejection:');
            workflowEntry.stage = 'REJECTED';
            workflowEntry.reason = reason;
        } else if (action === 'SAVE_DRAFT') {
            newStatus = 'DRAFT';
            workflowEntry.stage = 'DRAFT';
        }

        const updatedRequest = {
            ...formData,
            status: newStatus,
            workflow: [...(formData.workflow || []), workflowEntry],
            ...(action === 'REJECT' && { rejectionReason: reason }),
            ...(currentUser.role === USER_ROLES.MANAGER && action === 'APPROVE' && { managerApprovalDate: workflowEntry.date }),
            ...(currentUser.role === USER_ROLES.FINANCE && action === 'APPROVE' && { financeApprovalDate: workflowEntry.date }),
        };
        onSubmit(updatedRequest);
    };

    const canEdit = !readOnly && (isNew || formData.status === 'DRAFT');
    const canApprove = (currentUser.role === USER_ROLES.MANAGER && formData.status === 'PENDING_MANAGER_APPROVAL') ||
                      (currentUser.role === USER_ROLES.FINANCE && formData.status === 'PENDING_FINANCE_REVIEW');
    const canReject = (currentUser.role === USER_ROLES.MANAGER && formData.status === 'PENDING_MANAGER_APPROVAL') ||
                      (currentUser.role === USER_ROLES.FINANCE && formData.status === 'PENDING_FINANCE_REVIEW');
    const canSubmit = formData.status === 'DRAFT' && currentUser.role === USER_ROLES.EMPLOYEE;
    const canSaveDraft = isNew || formData.status === 'DRAFT';

    return (
        <div className="full-screen-content">
            <h2 style={{ color: 'var(--primary-color)' }}>{isNew ? 'Create New Travel Request' : `Travel Request: ${formData.title}`}</h2>
            <WorkflowTracker workflow={formData.workflow || []} currentStatus={formData.status} />

            <div className="form-grid mb-lg">
                <div className="form-group">
                    <label htmlFor="title">Title <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" id="title" name="title" value={formData.title || ''} onChange={handleChange} readOnly={!canEdit} required />
                    {errors.title && <span style={{ color: 'red', fontSize: 'var(--font-size-sm)' }}>{errors.title}</span>}
                </div>
                <div className="form-group">
                    <label>Employee</label>
                    <input type="text" value={formData.employeeName || currentUser.name} readOnly />
                </div>
                <div className="form-group">
                    <label htmlFor="destination">Destination <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" id="destination" name="destination" value={formData.destination || ''} onChange={handleChange} readOnly={!canEdit} required />
                    {errors.destination && <span style={{ color: 'red', fontSize: 'var(--font-size-sm)' }}>{errors.destination}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="estimatedCost">Estimated Cost <span style={{ color: 'red' }}>*</span></label>
                    <input type="number" id="estimatedCost" name="estimatedCost" value={formData.estimatedCost || ''} onChange={handleChange} readOnly={!canEdit} required min="0" />
                    {errors.estimatedCost && <span style={{ color: 'red', fontSize: 'var(--font-size-sm)' }}>{errors.estimatedCost}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="startDate">Start Date <span style={{ color: 'red' }}>*</span></label>
                    <input type="date" id="startDate" name="startDate" value={formData.startDate || ''} onChange={handleChange} readOnly={!canEdit} required />
                    {errors.startDate && <span style={{ color: 'red', fontSize: 'var(--font-size-sm)' }}>{errors.startDate}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="endDate">End Date <span style={{ color: 'red' }}>*</span></label>
                    <input type="date" id="endDate" name="endDate" value={formData.endDate || ''} onChange={handleChange} readOnly={!canEdit} required />
                    {errors.endDate && <span style={{ color: 'red', fontSize: 'var(--font-size-sm)' }}>{errors.endDate}</span>}
                </div>
                <div className="form-group full-width">
                    <label htmlFor="purpose">Purpose</label>
                    <textarea id="purpose" name="purpose" value={formData.purpose || ''} onChange={handleChange} readOnly={!canEdit}></textarea>
                </div>
                <div className="form-group full-width">
                    <label htmlFor="attachments">Attachments</label>
                    {!readOnly && (
                        <input type="file" id="attachments" name="attachments" multiple onChange={handleFileChange} disabled={!canEdit} />
                    )}
                    {(formData.attachments && formData.attachments.length > 0) && (
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--spacing-xs)' }}>
                            {formData.attachments.map((file, index) => (
                                <li key={index} style={{ marginBottom: 'var(--spacing-xxs)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                    <FaPaperclip /> <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                </li>
                            ))}
                        </ul>
                    )}
                    {readOnly && (formData.attachments === undefined || formData.attachments.length === 0) && (
                        <p className="text-muted">No attachments.</p>
                    )}
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}><FaTimes /> Close</button>
                {canSaveDraft && <button type="button" className="btn-primary" onClick={() => handleSubmit('SAVE_DRAFT')}><FaSave /> Save Draft</button>}
                {canSubmit && <button type="button" className="btn-primary" onClick={() => handleSubmit('SUBMIT')}><FaSave /> Submit for Approval</button>}
                {canApprove && <button type="button" className="btn-success" onClick={() => handleSubmit('APPROVE')}><FaCheck /> Approve</button>}
                {canReject && <button type="button" className="btn-danger" onClick={() => handleSubmit('REJECT')}><FaTimes /> Reject</button>}
            </div>

            {(formData.status === 'REJECTED' && formData.rejectionReason) && (
                <div className="mt-lg" style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--status-light-red)', borderLeft: '4px solid var(--status-red)', borderRadius: 'var(--border-radius-sm)' }}>
                    <h4 style={{ color: 'var(--status-red)', margin: 0 }}>Rejection Reason:</h4>
                    <p style={{ margin: 'var(--spacing-xs) 0 0 0' }}>{formData.rejectionReason}</p>
                </div>
            )}
        </div>
    );
};

const ExpenseForm = ({ expense, onSubmit, onCancel, readOnly, currentUser }) => {
    const isNew = !expense.id;
    const initialStatus = isNew ? 'DRAFT' : expense.status;
    const [formData, setFormData] = useState({
        ...expense,
        status: initialStatus,
        employeeName: expense.employeeName || currentUser.name,
        employeeId: expense.employeeId || currentUser.id,
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), ...files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }))]
        }));
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.title) newErrors.title = 'Title is required.';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be a positive number.';
        if (!formData.currency) newErrors.currency = 'Currency is required.';
        if (!formData.date) newErrors.date = 'Date is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (action) => {
        if (!validateForm()) return;

        let newStatus = formData.status;
        let workflowEntry = { stage: action, by: currentUser.id, date: new Date().toISOString().split('T')[0] };
        let reason = '';

        if (action === 'SUBMIT' && formData.status === 'DRAFT') {
            newStatus = 'PENDING_MANAGER_APPROVAL';
        } else if (action === 'APPROVE') {
            if (currentUser.role === USER_ROLES.MANAGER) {
                newStatus = 'PENDING_FINANCE_APPROVAL';
            } else if (currentUser.role === USER_ROLES.FINANCE) {
                newStatus = 'APPROVED';
            }
            workflowEntry.stage = newStatus === 'APPROVED' ? 'APPROVED' : 'APPROVED_BY_MANAGER';
        } else if (action === 'REJECT') {
            newStatus = 'REJECTED';
            reason = prompt('Reason for rejection:');
            workflowEntry.stage = 'REJECTED';
            workflowEntry.reason = reason;
        } else if (action === 'SAVE_DRAFT') {
            newStatus = 'DRAFT';
            workflowEntry.stage = 'DRAFT';
        } else if (action === 'PROCESS_REIMBURSEMENT' && currentUser.role === USER_ROLES.FINANCE && formData.status === 'APPROVED') {
            newStatus = 'REIMBURSED';
            workflowEntry.stage = 'REIMBURSED';
        }

        const updatedExpense = {
            ...formData,
            status: newStatus,
            workflow: [...(formData.workflow || []), workflowEntry],
            ...(action === 'REJECT' && { rejectionReason: reason }),
            ...(currentUser.role === USER_ROLES.MANAGER && action === 'APPROVE' && { managerApprovalDate: workflowEntry.date }),
            ...(currentUser.role === USER_ROLES.FINANCE && action === 'APPROVE' && { financeApprovalDate: workflowEntry.date }),
        };
        onSubmit(updatedExpense);
    };

    const canEdit = !readOnly && (isNew || formData.status === 'DRAFT');
    const canApprove = (currentUser.role === USER_ROLES.MANAGER && formData.status === 'PENDING_MANAGER_APPROVAL') ||
                      (currentUser.role === USER_ROLES.FINANCE && formData.status === 'PENDING_FINANCE_APPROVAL');
    const canReject = (currentUser.role === USER_ROLES.MANAGER && formData.status === 'PENDING_MANAGER_APPROVAL') ||
                      (currentUser.role === USER_ROLES.FINANCE && formData.status === 'PENDING_FINANCE_APPROVAL');
    const canSubmit = formData.status === 'DRAFT' && currentUser.role === USER_ROLES.EMPLOYEE;
    const canSaveDraft = isNew || formData.status === 'DRAFT';
    const canProcessReimbursement = currentUser.role === USER_ROLES.FINANCE && formData.status === 'APPROVED';

    return (
        <div className="full-screen-content">
            <h2 style={{ color: 'var(--primary-color)' }}>{isNew ? 'Create New Expense Claim' : `Expense Claim: ${formData.title}`}</h2>
            <WorkflowTracker workflow={formData.workflow || []} currentStatus={formData.status} />

            <div className="form-grid mb-lg">
                <div className="form-group">
                    <label htmlFor="title">Title <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" id="title" name="title" value={formData.title || ''} onChange={handleChange} readOnly={!canEdit} required />
                    {errors.title && <span style={{ color: 'red', fontSize: 'var(--font-size-sm)' }}>{errors.title}</span>}
                </div>
                <div className="form-group">
                    <label>Employee</label>
                    <input type="text" value={formData.employeeName || currentUser.name} readOnly />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Amount <span style={{ color: 'red' }}>*</span></label>
                    <input type="number" id="amount" name="amount" value={formData.amount || ''} onChange={handleChange} readOnly={!canEdit} required min="0" step="0.01" />
                    {errors.amount && <span style={{ color: 'red', fontSize: 'var(--font-size-sm)' }}>{errors.amount}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="currency">Currency <span style={{ color: 'red' }}>*</span></label>
                    <select id="currency" name="currency" value={formData.currency || ''} onChange={handleChange} disabled={!canEdit} required>
                        <option value="">Select Currency</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                    </select>
                    {errors.currency && <span style={{ color: 'red', fontSize: 'var(--font-size-sm)' }}>{errors.currency}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="date">Date <span style={{ color: 'red' }}>*</span></label>
                    <input type="date" id="date" name="date" value={formData.date || ''} onChange={handleChange} readOnly={!canEdit} required />
                    {errors.date && <span style={{ color: 'red', fontSize: 'var(--font-size-sm)' }}>{errors.date}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="relatedTravelRequest">Related Travel Request</label>
                    <select id="relatedTravelRequest" name="relatedTravelRequest" value={formData.relatedTravelRequest || ''} onChange={handleChange} disabled={!canEdit}>
                        <option value="">None</option>
                        {dummyTravelRequests.filter(tr => tr.employeeId === currentUser.id || currentUser.role === USER_ROLES.ADMIN).map(tr => (
                            <option key={tr.id} value={tr.id}>{`${tr.id} - ${tr.title}`}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group full-width">
                    <label htmlFor="attachments">Attachments</label>
                    {!readOnly && (
                        <input type="file" id="attachments" name="attachments" multiple onChange={handleFileChange} disabled={!canEdit} />
                    )}
                    {(formData.attachments && formData.attachments.length > 0) && (
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--spacing-xs)' }}>
                            {formData.attachments.map((file, index) => (
                                <li key={index} style={{ marginBottom: 'var(--spacing-xxs)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                    <FaPaperclip /> <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                </li>
                            ))}
                        </ul>
                    )}
                    {readOnly && (formData.attachments === undefined || formData.attachments.length === 0) && (
                        <p className="text-muted">No attachments.</p>
                    )}
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}><FaTimes /> Close</button>
                {canSaveDraft && <button type="button" className="btn-primary" onClick={() => handleSubmit('SAVE_DRAFT')}><FaSave /> Save Draft</button>}
                {canSubmit && <button type="button" className="btn-primary" onClick={() => handleSubmit('SUBMIT')}><FaSave /> Submit for Approval</button>}
                {canApprove && <button type="button" className="btn-success" onClick={() => handleSubmit('APPROVE')}><FaCheck /> Approve</button>}
                {canReject && <button type="button" className="btn-danger" onClick={() => handleSubmit('REJECT')}><FaTimes /> Reject</button>}
                {canProcessReimbursement && <button type="button" className="btn-primary" onClick={() => handleSubmit('PROCESS_REIMBURSEMENT')}><FaDollarSign /> Process Reimbursement</button>}
            </div>

            {(formData.status === 'REJECTED' && formData.rejectionReason) && (
                <div className="mt-lg" style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--status-light-red)', borderLeft: '4px solid var(--status-red)', borderRadius: 'var(--border-radius-sm)' }}>
                    <h4 style={{ color: 'var(--status-red)', margin: 0 }}>Rejection Reason:</h4>
                    <p style={{ margin: 'var(--spacing-xs) 0 0 0' }}>{formData.rejectionReason}</p>
                </div>
            )}
        </div>
    );
};


const UserDetail = ({ user, onSave, onCancel, currentUser }) => {
    const [formData, setFormData] = useState(user);
    const isEditing = currentUser.role === USER_ROLES.ADMIN;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <div className="full-screen-content">
            <h2 style={{ color: 'var(--primary-color)' }}>User Details: {user.name}</h2>
            <div className="form-grid mb-lg">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange} disabled={!isEditing}>
                        {Object.values(USER_ROLES).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input type="text" id="department" name="department" value={formData.department} onChange={handleChange} readOnly={!isEditing} />
                </div>
            </div>
            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}><FaTimes /> Close</button>
                {isEditing && <button type="button" className="btn-primary" onClick={handleSubmit}><FaSave /> Save Changes</button>}
            </div>
        </div>
    );
};

// --- Dashboards ---
const AdminDashboard = ({ navigate, currentUser, travelRequests, expenses, users }) => {
    const totalRequests = travelRequests.length;
    const pendingTravelApprovals = travelRequests.filter(tr => tr.status.includes('PENDING')).length;
    const pendingExpenseApprovals = expenses.filter(exp => exp.status.includes('PENDING')).length;
    const totalUsers = users.length;

    return (
        <div className="main-content">
            <div className="header">
                <h1>Admin Dashboard</h1>
                <div className="header-actions">
                    <span className="user-info">Logged in as {currentUser.name} ({currentUser.role})</span>
                    <button onClick={() => navigate('NewTravelRequestForm')}><FaPlus /> New Travel Request</button>
                </div>
            </div>

            <div className="dashboard-grid mb-lg">
                <Card
                    title="Total Travel Requests"
                    description={`Overview of ${totalRequests} requests.`}
                    status="IN_PROGRESS"
                    onClick={() => navigate('TravelRequestsList')}
                    typeLabel="Metric"
                    typeIcon={<FaPlaneDeparture />}
                    footerRight={<>View All <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--primary-color)' }}>{totalRequests}</h2>
                </Card>
                <Card
                    title="Pending Travel Approvals"
                    description="Requests awaiting review from Managers/Finance."
                    status="PENDING_MANAGER_APPROVAL"
                    onClick={() => navigate('TravelRequestsList', { filter: 'PENDING' })}
                    typeLabel="Metric"
                    typeIcon={<FaClipboardList />}
                    footerRight={<>Review Now <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-orange)' }}>{pendingTravelApprovals}</h2>
                </Card>
                <Card
                    title="Pending Expense Approvals"
                    description="Expenses awaiting review from Managers/Finance."
                    status="PENDING_FINANCE_APPROVAL"
                    onClick={() => navigate('ExpensesList', { filter: 'PENDING' })}
                    typeLabel="Metric"
                    typeIcon={<FaFileInvoiceDollar />}
                    footerRight={<>Review Now <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-orange)' }}>{pendingExpenseApprovals}</h2>
                </Card>
                <Card
                    title="Total Users"
                    description="All registered users in TravelDesk."
                    status="APPROVED"
                    onClick={() => navigate('UsersList')}
                    typeLabel="Metric"
                    typeIcon={<FaUsers />}
                    footerRight={<>Manage Users <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-green)' }}>{totalUsers}</h2>
                </Card>
            </div>

            <h2 className="mb-lg" style={{ color: 'var(--primary-color)' }}>Key Performance Indicators</h2>
            <div className="dashboard-grid">
                <ChartPlaceholder title="Travel Spend by Department" type="Bar" />
                <ChartPlaceholder title="Average Approval Time" type="Gauge" />
                <ChartPlaceholder title="SLA Compliance Rate" type="Donut" />
                <ChartPlaceholder title="Historical Travel Requests" type="Line" />
            </div>
        </div>
    );
};

const EmployeeDashboard = ({ navigate, currentUser, travelRequests, expenses }) => {
    const myTravelRequests = travelRequests.filter(req => req.employeeId === currentUser.id);
    const myExpenses = expenses.filter(exp => exp.employeeId === currentUser.id);

    const pendingMyTravelRequests = myTravelRequests.filter(req => req.status.includes('PENDING')).length;
    const approvedMyTravelRequests = myTravelRequests.filter(req => req.status === 'APPROVED' || req.status === 'BOOKED').length;
    const pendingMyExpenses = myExpenses.filter(exp => exp.status.includes('PENDING')).length;
    const reimbursedMyExpenses = myExpenses.filter(exp => exp.status === 'REIMBURSED').length;

    return (
        <div className="main-content">
            <div className="header">
                <h1>My TravelDesk</h1>
                <div className="header-actions">
                    <span className="user-info">Logged in as {currentUser.name} ({currentUser.role})</span>
                    <button onClick={() => navigate('NewTravelRequestForm')}><FaPlus /> New Travel Request</button>
                    <button onClick={() => navigate('NewExpenseForm')}><FaPlus /> New Expense Claim</button>
                </div>
            </div>

            <div className="dashboard-grid mb-lg">
                <Card
                    title="My Pending Travel Requests"
                    description="Requests awaiting manager/finance approval."
                    status="PENDING_MANAGER_APPROVAL"
                    onClick={() => navigate('TravelRequestsList', { filter: 'PENDING', myRequests: true })}
                    typeLabel="My Requests"
                    typeIcon={<FaPlaneDeparture />}
                    footerRight={<>View Details <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-orange)' }}>{pendingMyTravelRequests}</h2>
                </Card>
                <Card
                    title="My Approved Travel Requests"
                    description="Approved requests ready for booking or already booked."
                    status="APPROVED"
                    onClick={() => navigate('TravelRequestsList', { filter: 'APPROVED', myRequests: true })}
                    typeLabel="My Requests"
                    typeIcon={<FaCheck />}
                    footerRight={<>View Details <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-green)' }}>{approvedMyTravelRequests}</h2>
                </Card>
                <Card
                    title="My Pending Expense Claims"
                    description="Expenses awaiting approval from your manager."
                    status="PENDING_MANAGER_APPROVAL"
                    onClick={() => navigate('ExpensesList', { filter: 'PENDING', myExpenses: true })}
                    typeLabel="My Expenses"
                    typeIcon={<FaFileInvoiceDollar />}
                    footerRight={<>View Details <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-orange)' }}>{pendingMyExpenses}</h2>
                </Card>
                <Card
                    title="My Reimbursed Expenses"
                    description="Expenses that have been processed and reimbursed."
                    status="REIMBURSED"
                    onClick={() => navigate('ExpensesList', { filter: 'REIMBURSED', myExpenses: true })}
                    typeLabel="My Expenses"
                    typeIcon={<FaMoneyBillWave />}
                    footerRight={<>View Details <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-green)' }}>{reimbursedMyExpenses}</h2>
                </Card>
            </div>

            <h2 className="mb-lg" style={{ color: 'var(--primary-color)' }}>My Recent Activities</h2>
            <div className="dashboard-grid">
                {myTravelRequests.slice(0, 3).map(req => (
                    <Card
                        key={req.id}
                        title={req.title}
                        description={`${req.destination} (${req.startDate} to ${req.endDate})`}
                        status={req.status}
                        onClick={() => navigate('TravelRequestDetail', { id: req.id })}
                        typeLabel="Travel Request"
                        typeIcon={<FaPlaneDeparture />}
                        footerLeft={req.id}
                        footerRight={req.submittedDate}
                    />
                ))}
                {myExpenses.slice(0, 3).map(exp => (
                    <Card
                        key={exp.id}
                        title={exp.title}
                        description={`Amount: ${exp.currency} ${exp.amount}`}
                        status={exp.status}
                        onClick={() => navigate('ExpenseDetail', { id: exp.id })}
                        typeLabel="Expense Claim"
                        typeIcon={<FaFileInvoiceDollar />}
                        footerLeft={exp.id}
                        footerRight={exp.date}
                    />
                ))}
            </div>
        </div>
    );
};

const ManagerDashboard = ({ navigate, currentUser, travelRequests, expenses }) => {
    const myReports = dummyUsers.filter(u => u.role === USER_ROLES.EMPLOYEE && u.department === currentUser.department);
    const myReportingEmployeeIds = myReports.map(emp => emp.id);

    const travelRequestsForApproval = travelRequests.filter(req =>
        myReportingEmployeeIds.includes(req.employeeId) && req.status === 'PENDING_MANAGER_APPROVAL'
    );
    const expensesForApproval = expenses.filter(exp =>
        myReportingEmployeeIds.includes(exp.employeeId) && exp.status === 'PENDING_MANAGER_APPROVAL'
    );
    const totalTeamTravelRequests = travelRequests.filter(req => myReportingEmployeeIds.includes(req.employeeId)).length;
    const totalTeamExpenses = expenses.filter(exp => myReportingEmployeeIds.includes(exp.employeeId)).length;

    return (
        <div className="main-content">
            <div className="header">
                <h1>Manager Dashboard</h1>
                <div className="header-actions">
                    <span className="user-info">Logged in as {currentUser.name} ({currentUser.role})</span>
                    <button onClick={() => navigate('NewTravelRequestForm')}><FaPlus /> New Travel Request</button>
                    <button onClick={() => navigate('NewExpenseForm')}><FaPlus /> New Expense Claim</button>
                </div>
            </div>

            <div className="dashboard-grid mb-lg">
                <Card
                    title="Travel Requests for Approval"
                    description="Incoming travel requests from your team members."
                    status="PENDING_MANAGER_APPROVAL"
                    onClick={() => navigate('TravelRequestsList', { filter: 'PENDING_MANAGER_APPROVAL', teamRequests: true })}
                    typeLabel="Team Approval"
                    typeIcon={<FaClipboardList />}
                    footerRight={<>Review Now <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-orange)' }}>{travelRequestsForApproval.length}</h2>
                </Card>
                <Card
                    title="Expense Claims for Approval"
                    description="Incoming expense claims from your team members."
                    status="PENDING_MANAGER_APPROVAL"
                    onClick={() => navigate('ExpensesList', { filter: 'PENDING_MANAGER_APPROVAL', teamExpenses: true })}
                    typeLabel="Team Approval"
                    typeIcon={<FaFileInvoiceDollar />}
                    footerRight={<>Review Now <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-orange)' }}>{expensesForApproval.length}</h2>
                </Card>
                <Card
                    title="Total Team Travel Requests"
                    description="Overview of all travel requests by your direct reports."
                    status="IN_PROGRESS"
                    onClick={() => navigate('TravelRequestsList', { teamRequests: true })}
                    typeLabel="Team Data"
                    typeIcon={<FaPlaneDeparture />}
                    footerRight={<>View All <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--primary-color)' }}>{totalTeamTravelRequests}</h2>
                </Card>
                <Card
                    title="Total Team Expense Claims"
                    description="Overview of all expense claims by your direct reports."
                    status="APPROVED"
                    onClick={() => navigate('ExpensesList', { teamExpenses: true })}
                    typeLabel="Team Data"
                    typeIcon={<FaMoneyBillWave />}
                    footerRight={<>View All <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-green)' }}>{totalTeamExpenses}</h2>
                </Card>
            </div>

            <h2 className="mb-lg" style={{ color: 'var(--primary-color)' }}>Recent Team Activities</h2>
            <div className="dashboard-grid">
                {travelRequestsForApproval.slice(0, 3).map(req => (
                    <Card
                        key={req.id}
                        title={req.title}
                        description={`Submitted by ${req.employeeName} for ${req.destination}`}
                        status={req.status}
                        onClick={() => navigate('TravelRequestDetail', { id: req.id })}
                        typeLabel="Travel Request"
                        typeIcon={<FaPlaneDeparture />}
                        footerLeft={req.id}
                        footerRight={req.submittedDate}
                    />
                ))}
                {expensesForApproval.slice(0, 3).map(exp => (
                    <Card
                        key={exp.id}
                        title={exp.title}
                        description={`By ${exp.employeeName}: ${exp.currency} ${exp.amount}`}
                        status={exp.status}
                        onClick={() => navigate('ExpenseDetail', { id: exp.id })}
                        typeLabel="Expense Claim"
                        typeIcon={<FaFileInvoiceDollar />}
                        footerLeft={exp.id}
                        footerRight={exp.date}
                    />
                ))}
            </div>
        </div>
    );
};

const FinanceTeamDashboard = ({ navigate, currentUser, travelRequests, expenses }) => {
    const travelRequestsForFinanceReview = travelRequests.filter(tr => tr.status === 'PENDING_FINANCE_REVIEW');
    const expensesForFinanceApproval = expenses.filter(exp => exp.status === 'PENDING_FINANCE_APPROVAL');
    const expensesPendingReimbursement = expenses.filter(exp => exp.status === 'APPROVED');
    const totalTravelCostsApproved = travelRequests.filter(tr => tr.status === 'APPROVED' || tr.status === 'BOOKED' || tr.status === 'COMPLETED').reduce((sum, tr) => sum + tr.estimatedCost, 0);
    const totalExpensesReimbursed = expenses.filter(exp => exp.status === 'REIMBURSED').reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="main-content">
            <div className="header">
                <h1>Finance Dashboard</h1>
                <div className="header-actions">
                    <span className="user-info">Logged in as {currentUser.name} ({currentUser.role})</span>
                    <button onClick={() => navigate('NewExpenseForm')}><FaPlus /> New Expense Claim</button>
                </div>
            </div>

            <div className="dashboard-grid mb-lg">
                <Card
                    title="Travel Requests for Review"
                    description="Requests requiring final financial approval."
                    status="PENDING_FINANCE_REVIEW"
                    onClick={() => navigate('TravelRequestsList', { filter: 'PENDING_FINANCE_REVIEW' })}
                    typeLabel="Financial Approval"
                    typeIcon={<FaClipboardList />}
                    footerRight={<>Review Now <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-orange)' }}>{travelRequestsForFinanceReview.length}</h2>
                </Card>
                <Card
                    title="Expense Claims for Approval"
                    description="Expenses awaiting final financial approval."
                    status="PENDING_FINANCE_APPROVAL"
                    onClick={() => navigate('ExpensesList', { filter: 'PENDING_FINANCE_APPROVAL' })}
                    typeLabel="Financial Approval"
                    typeIcon={<FaFileInvoiceDollar />}
                    footerRight={<>Review Now <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-orange)' }}>{expensesForFinanceApproval.length}</h2>
                </Card>
                <Card
                    title="Expenses Pending Reimbursement"
                    description="Approved expenses awaiting payment processing."
                    status="APPROVED"
                    onClick={() => navigate('ExpensesList', { filter: 'APPROVED' })}
                    typeLabel="Reimbursement"
                    typeIcon={<FaMoneyBillWave />}
                    footerRight={<>Process Now <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-blue)' }}>{expensesPendingReimbursement.length}</h2>
                </Card>
                <Card
                    title="Total Reimbursed"
                    description="Total amount disbursed for approved expenses."
                    status="REIMBURSED"
                    onClick={() => navigate('ExpensesList', { filter: 'REIMBURSED' })}
                    typeLabel="Financial Metric"
                    typeIcon={<FaDollarSign />}
                    footerRight={<>View History <FaArrowLeft style={{ transform: 'rotate(-135deg)' }} /></>}
                >
                    <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--status-green)' }}>${totalExpensesReimbursed.toFixed(2)}</h2>
                </Card>
            </div>

            <h2 className="mb-lg" style={{ color: 'var(--primary-color)' }}>Financial Overviews</h2>
            <div className="dashboard-grid">
                <ChartPlaceholder title="Monthly Travel Spend" type="Line" />
                <ChartPlaceholder title="Expense Categories Breakdown" type="Donut" />
                <ChartPlaceholder title="Budget Utilization" type="Gauge" />
                <ChartPlaceholder title="SLA Compliance on Reimbursements" type="Bar" />
            </div>
        </div>
    );
};

// --- Lists / Grids ---
const TravelRequestsList = ({ navigate, currentUser, travelRequests }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredRequests = travelRequests.filter(req => {
        const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              req.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              req.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || req.status.includes(filterStatus);

        let hasAccess = false;
        if (currentUser.role === USER_ROLES.ADMIN) {
            hasAccess = true;
        } else if (currentUser.role === USER_ROLES.EMPLOYEE) {
            hasAccess = req.employeeId === currentUser.id;
        } else if (currentUser.role === USER_ROLES.MANAGER) {
            const myReports = dummyUsers.filter(u => u.role === USER_ROLES.EMPLOYEE && u.department === currentUser.department);
            hasAccess = myReports.some(rep => rep.id === req.employeeId) || req.employeeId === currentUser.id;
        } else if (currentUser.role === USER_ROLES.FINANCE) {
            hasAccess = true; // Finance can see all for review purposes
        }
        return matchesSearch && matchesStatus && hasAccess;
    });

    return (
        <div className="main-content">
            <div className="header">
                <h1>Travel Requests</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending Approval</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="DRAFT">Draft</option>
                        <option value="BOOKED">Booked</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                    {currentUser.role === USER_ROLES.EMPLOYEE && (
                        <button className="btn-primary" onClick={() => navigate('NewTravelRequestForm')}><FaPlus /> New Request</button>
                    )}
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Employee</th>
                            <th>Destination</th>
                            <th>Cost</th>
                            <th>Status</th>
                            <th>Submitted Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (
                                <tr key={req.id} onClick={() => navigate('TravelRequestDetail', { id: req.id })}>
                                    <td>{req.id}</td>
                                    <td>{req.title}</td>
                                    <td>{req.employeeName}</td>
                                    <td>{req.destination}</td>
                                    <td>${req.estimatedCost?.toFixed(2)}</td>
                                    <td><StatusBadge status={req.status} /></td>
                                    <td>{req.submittedDate}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="action-buttons">
                                            <button onClick={() => navigate('TravelRequestDetail', { id: req.id })} title="View Details"><FaGlobe /></button>
                                            {
                                                (currentUser.role === USER_ROLES.EMPLOYEE && req.status === 'DRAFT' && req.employeeId === currentUser.id) &&
                                                <button onClick={() => navigate('TravelRequestDetail', { id: req.id, mode: 'edit' })} title="Edit Draft"><FaSave /></button>
                                            }
                                            {
                                                ((currentUser.role === USER_ROLES.MANAGER && req.status === 'PENDING_MANAGER_APPROVAL' && req.managerId === currentUser.id) ||
                                                (currentUser.role === USER_ROLES.FINANCE && req.status === 'PENDING_FINANCE_REVIEW' && req.financeId === currentUser.id)) &&
                                                <button onClick={() => navigate('TravelRequestDetail', { id: req.id, mode: 'approve' })} title="Approve/Reject"><FaCheck /></button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center text-muted" style={{ padding: 'var(--spacing-lg)' }}>No travel requests found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ExpensesList = ({ navigate, currentUser, expenses }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              exp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              exp.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || exp.status.includes(filterStatus);

        let hasAccess = false;
        if (currentUser.role === USER_ROLES.ADMIN || currentUser.role === USER_ROLES.FINANCE) {
            hasAccess = true;
        } else if (currentUser.role === USER_ROLES.EMPLOYEE) {
            hasAccess = exp.employeeId === currentUser.id;
        } else if (currentUser.role === USER_ROLES.MANAGER) {
            const myReports = dummyUsers.filter(u => u.role === USER_ROLES.EMPLOYEE && u.department === currentUser.department);
            hasAccess = myReports.some(rep => rep.id === exp.employeeId) || exp.employeeId === currentUser.id;
        }
        return matchesSearch && matchesStatus && hasAccess;
    });

    return (
        <div className="main-content">
            <div className="header">
                <h1>Expense Claims</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending Approval</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="DRAFT">Draft</option>
                        <option value="REIMBURSED">Reimbursed</option>
                    </select>
                    {currentUser.role === USER_ROLES.EMPLOYEE && (
                        <button className="btn-primary" onClick={() => navigate('NewExpenseForm')}><FaPlus /> New Claim</button>
                    )}
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Employee</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Related TR</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.length > 0 ? (
                            filteredExpenses.map(exp => (
                                <tr key={exp.id} onClick={() => navigate('ExpenseDetail', { id: exp.id })}>
                                    <td>{exp.id}</td>
                                    <td>{exp.title}</td>
                                    <td>{exp.employeeName}</td>
                                    <td>{exp.currency} {exp.amount?.toFixed(2)}</td>
                                    <td>{exp.date}</td>
                                    <td><StatusBadge status={exp.status} /></td>
                                    <td>{exp.relatedTravelRequest || 'N/A'}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="action-buttons">
                                            <button onClick={() => navigate('ExpenseDetail', { id: exp.id })} title="View Details"><FaGlobe /></button>
                                            {
                                                (currentUser.role === USER_ROLES.EMPLOYEE && exp.status === 'DRAFT' && exp.employeeId === currentUser.id) &&
                                                <button onClick={() => navigate('ExpenseDetail', { id: exp.id, mode: 'edit' })} title="Edit Draft"><FaSave /></button>
                                            }
                                            {
                                                ((currentUser.role === USER_ROLES.MANAGER && exp.status === 'PENDING_MANAGER_APPROVAL' && exp.managerId === currentUser.id) ||
                                                (currentUser.role === USER_ROLES.FINANCE && exp.status === 'PENDING_FINANCE_APPROVAL' && exp.financeId === currentUser.id)) &&
                                                <button onClick={() => navigate('ExpenseDetail', { id: exp.id, mode: 'approve' })} title="Approve/Reject"><FaCheck /></button>
                                            }
                                            {
                                                (currentUser.role === USER_ROLES.FINANCE && exp.status === 'APPROVED') &&
                                                <button onClick={() => navigate('ExpenseDetail', { id: exp.id, mode: 'process' })} title="Process Reimbursement"><FaDollarSign /></button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center text-muted" style={{ padding: 'var(--spacing-lg)' }}>No expense claims found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const UsersList = ({ navigate, currentUser, users }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!PERMISSIONS.MANAGE_USERS.includes(currentUser.role)) {
        return <div className="main-content">Access Denied</div>;
    }

    return (
        <div className="main-content">
            <div className="header">
                <h1>User Management</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <button className="btn-primary"><FaPlus /> Add User</button> {/* Dummy for now */}
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id} onClick={() => navigate('UserDetail', { id: user.id })}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.department}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="action-buttons">
                                            <button onClick={() => navigate('UserDetail', { id: user.id })} title="View Details"><FaGlobe /></button>
                                            {PERMISSIONS.MANAGE_USERS.includes(currentUser.role) && (
                                                <button onClick={() => navigate('UserDetail', { id: user.id, mode: 'edit' })} title="Edit User"><FaSave /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted" style={{ padding: 'var(--spacing-lg)' }}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AuditLogsList = ({ navigate, currentUser, auditLogs }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = auditLogs.filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!PERMISSIONS.VIEW_AUDIT_LOGS.includes(currentUser.role)) {
        return <div className="main-content">Access Denied</div>;
    }

    return (
        <div className="main-content">
            <div className="header">
                <h1>Audit Logs</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <button className="btn-primary"><FaFileContract /> Export Logs</button>
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Entity Type</th>
                            <th>Entity ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td>{log.timestamp}</td>
                                    <td>{log.user}</td>
                                    <td>{log.action}</td>
                                    <td>{log.entityType}</td>
                                    <td>{log.entityId}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-muted" style={{ padding: 'var(--spacing-lg)' }}>No audit logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main Application ---
const App = () => {
    const [currentUser, setCurrentUser] = useState(dummyUsers[1]); // Default to Bob Employee
    const [travelRequests, setTravelRequests] = useState(dummyTravelRequests);
    const [expenses, setExpenses] = useState(dummyExpenses);
    const [users, setUsers] = useState(dummyUsers);
    const [auditLogs, setAuditLogs] = useState(dummyAuditLogs);
    const [currentScreen, setCurrentScreen] = useState({ name: 'Dashboard' });
    const [screenHistory, setScreenHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');

    const addNotification = (message, type = 'info') => {
        const id = generateId('NOTIF');
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeNotification(id), 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const login = (user) => {
        setCurrentUser(user);
        navigate('Dashboard');
        addNotification(`Welcome, ${user.name}! You are logged in as ${user.role}.`, 'success');
    };

    const logout = () => {
        setCurrentUser(null);
        setCurrentScreen({ name: 'Login' });
        setScreenHistory([]);
        addNotification('You have been logged out.', 'info');
    };

    const navigate = (screenName, params = {}) => {
        setScreenHistory(prev => [...prev, currentScreen]);
        setCurrentScreen({ name: screenName, ...params });
        setShowGlobalSearch(false); // Close search overlay on navigation
    };

    const goBack = () => {
        if (screenHistory.length > 0) {
            const previousScreen = screenHistory.pop();
            setScreenHistory([...screenHistory]); // Ensure state update
            setCurrentScreen(previousScreen);
        } else {
            setCurrentScreen({ name: 'Dashboard' }); // Fallback to dashboard
        }
    };

    const handleTravelRequestSubmit = (updatedRequest) => {
        if (updatedRequest.id) {
            setTravelRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
            addNotification(`Travel Request ${updatedRequest.id} updated to ${updatedRequest.status.replace(/_/g, ' ')}.`, 'success');
        } else {
            const newRequest = { ...updatedRequest, id: generateId('TR') };
            setTravelRequests(prev => [...prev, newRequest]);
            addNotification(`New Travel Request ${newRequest.id} created as ${newRequest.status.replace(/_/g, ' ')}.`, 'success');
        }
        goBack();
    };

    const handleExpenseSubmit = (updatedExpense) => {
        if (updatedExpense.id) {
            setExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
            addNotification(`Expense Claim ${updatedExpense.id} updated to ${updatedExpense.status.replace(/_/g, ' ')}.`, 'success');
        } else {
            const newExpense = { ...updatedExpense, id: generateId('EXP') };
            setExpenses(prev => [...prev, newExpense]);
            addNotification(`New Expense Claim ${newExpense.id} created as ${newExpense.status.replace(/_/g, ' ')}.`, 'success');
        }
        goBack();
    };

    const handleUserSave = (updatedUser) => {
        setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
        addNotification(`User ${updatedUser.name} updated.`, 'success');
        goBack();
    };

    const globalSearchResults = globalSearchTerm.length > 2 ? [
        ...travelRequests.filter(tr => canAccess(PERMISSIONS.VIEW_TRAVEL_REQUESTS_OWN, currentUser) && (tr.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) || tr.destination.toLowerCase().includes(globalSearchTerm.toLowerCase()))).map(tr => ({
            id: tr.id,
            title: tr.title,
            type: 'Travel Request',
            icon: <FaPlaneDeparture />,
            status: tr.status,
            onClick: () => navigate('TravelRequestDetail', { id: tr.id })
        })),
        ...expenses.filter(exp => canAccess(PERMISSIONS.VIEW_EXPENSES_OWN, currentUser) && (exp.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) || exp.employeeName.toLowerCase().includes(globalSearchTerm.toLowerCase()))).map(exp => ({
            id: exp.id,
            title: exp.title,
            type: 'Expense Claim',
            icon: <FaFileInvoiceDollar />,
            status: exp.status,
            onClick: () => navigate('ExpenseDetail', { id: exp.id })
        })),
        ...(currentUser.role === USER_ROLES.ADMIN ? users.filter(user => user.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) || user.email.toLowerCase().includes(globalSearchTerm.toLowerCase())).map(user => ({
            id: user.id,
            title: user.name,
            type: 'User Profile',
            icon: <FaUsers />,
            status: user.role,
            onClick: () => navigate('UserDetail', { id: user.id })
        })) : []),
    ] : [];

    // RBAC check function
    const canAccess = (requiredPermissions, user) => {
        if (!user || !user.role) return false;
        return requiredPermissions.includes(user.role);
    };

    // Render logic for different screens
    const renderScreen = () => {
        if (!currentUser) {
            return (
                <div className="login-screen flex flex-col items-center justify-center" style={{ height: '100vh' }}>
                    <h1 style={{ color: 'var(--primary-color)' }} className="mb-lg">TravelDesk Login</h1>
                    <div className="flex gap-md">
                        {dummyUsers.map(user => (
                            <button key={user.id} onClick={() => login(user)} className="btn-primary" style={{ minWidth: '150px' }}>
                                Login as {user.name} ({user.role})
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        const screenName = currentScreen.name;
        const screenId = currentScreen.id;
        const screenMode = currentScreen.mode;

        const screenContent = () => {
            switch (screenName) {
                case 'Dashboard':
                    if (canAccess(PERMISSIONS.DASHBOARD_ADMIN, currentUser)) return <AdminDashboard navigate={navigate} currentUser={currentUser} travelRequests={travelRequests} expenses={expenses} users={users} />;
                    if (canAccess(PERMISSIONS.DASHBOARD_EMPLOYEE, currentUser)) return <EmployeeDashboard navigate={navigate} currentUser={currentUser} travelRequests={travelRequests} expenses={expenses} />;
                    if (canAccess(PERMISSIONS.DASHBOARD_MANAGER, currentUser)) return <ManagerDashboard navigate={navigate} currentUser={currentUser} travelRequests={travelRequests} expenses={expenses} />;
                    if (canAccess(PERMISSIONS.DASHBOARD_FINANCE, currentUser)) return <FinanceTeamDashboard navigate={navigate} currentUser={currentUser} travelRequests={travelRequests} expenses={expenses} />;
                    return <div className="main-content">Access Denied to Dashboard</div>;

                case 'TravelRequestsList':
                    return <TravelRequestsList navigate={navigate} currentUser={currentUser} travelRequests={travelRequests} />;
                case 'TravelRequestDetail':
                    if (!screenId) return <div className="full-screen-content">Travel Request not found.</div>;
                    const selectedTravelRequest = travelRequests.find(req => req.id === screenId);
                    if (!selectedTravelRequest) return <div className="full-screen-content">Travel Request {screenId} not found.</div>;

                    const isEmployeeOwner = selectedTravelRequest.employeeId === currentUser.id;
                    const isManagerApprover = selectedTravelRequest.managerId === currentUser.id && selectedTravelRequest.status === 'PENDING_MANAGER_APPROVAL';
                    const isFinanceApprover = selectedTravelRequest.financeId === currentUser.id && selectedTravelRequest.status === 'PENDING_FINANCE_REVIEW';
                    const canViewAll = canAccess(PERMISSIONS.VIEW_TRAVEL_REQUESTS_ALL, currentUser);
                    const canViewOwn = canAccess(PERMISSIONS.VIEW_TRAVEL_REQUESTS_OWN, currentUser) && isEmployeeOwner;

                    if (!canViewAll && !canViewOwn && !isManagerApprover && !isFinanceApprover) {
                        return <div className="full-screen-content">Access Denied to Travel Request {screenId}</div>;
                    }

                    let readOnly = true;
                    if (screenMode === 'edit' && isEmployeeOwner && selectedTravelRequest.status === 'DRAFT') {
                        readOnly = false;
                    } else if (screenMode === 'approve' && (isManagerApprover || isFinanceApprover)) {
                        readOnly = false; // Form allows approve/reject actions
                    }

                    return (
                        <div className="full-screen-view">
                            <div className="full-screen-header">
                                <button className="back-button" onClick={goBack}><FaArrowLeft /> Back</button>
                                <h2>Travel Request Details</h2>
                            </div>
                            <TravelRequestForm request={selectedTravelRequest} onSubmit={handleTravelRequestSubmit} onCancel={goBack} readOnly={readOnly} currentUser={currentUser} />
                        </div>
                    );
                case 'NewTravelRequestForm':
                    if (!canAccess(PERMISSIONS.CREATE_TRAVEL_REQUEST, currentUser)) return <div className="full-screen-content">Access Denied to Create Travel Request</div>;
                    return (
                        <div className="full-screen-view">
                            <div className="full-screen-header">
                                <button className="back-button" onClick={goBack}><FaArrowLeft /> Back</button>
                                <h2>Create New Travel Request</h2>
                            </div>
                            <TravelRequestForm request={{ status: 'DRAFT' }} onSubmit={handleTravelRequestSubmit} onCancel={goBack} readOnly={false} currentUser={currentUser} />
                        </div>
                    );

                case 'ExpensesList':
                    return <ExpensesList navigate={navigate} currentUser={currentUser} expenses={expenses} />;
                case 'ExpenseDetail':
                    if (!screenId) return <div className="full-screen-content">Expense not found.</div>;
                    const selectedExpense = expenses.find(exp => exp.id === screenId);
                    if (!selectedExpense) return <div className="full-screen-content">Expense {screenId} not found.</div>;

                    const isEmployeeOwnerExp = selectedExpense.employeeId === currentUser.id;
                    const isManagerApproverExp = selectedExpense.managerId === currentUser.id && selectedExpense.status === 'PENDING_MANAGER_APPROVAL';
                    const isFinanceApproverExp = selectedExpense.financeId === currentUser.id && selectedExpense.status === 'PENDING_FINANCE_APPROVAL';
                    const isFinanceProcessorExp = currentUser.role === USER_ROLES.FINANCE && selectedExpense.status === 'APPROVED';

                    const canViewAllExp = canAccess(PERMISSIONS.VIEW_EXPENSES_ALL, currentUser);
                    const canViewTeamExp = canAccess(PERMISSIONS.VIEW_EXPENSES_TEAM, currentUser) && dummyUsers.filter(u => u.department === currentUser.department).some(u => u.id === selectedExpense.employeeId);
                    const canViewOwnExp = canAccess(PERMISSIONS.VIEW_EXPENSES_OWN, currentUser) && isEmployeeOwnerExp;

                    if (!canViewAllExp && !canViewTeamExp && !canViewOwnExp && !isManagerApproverExp && !isFinanceApproverExp && !isFinanceProcessorExp) {
                        return <div className="full-screen-content">Access Denied to Expense {screenId}</div>;
                    }

                    let readOnlyExp = true;
                    if (screenMode === 'edit' && isEmployeeOwnerExp && selectedExpense.status === 'DRAFT') {
                        readOnlyExp = false;
                    } else if (screenMode === 'approve' && (isManagerApproverExp || isFinanceApproverExp)) {
                        readOnlyExp = false;
                    } else if (screenMode === 'process' && isFinanceProcessorExp) {
                        readOnlyExp = false;
                    }

                    return (
                        <div className="full-screen-view">
                            <div className="full-screen-header">
                                <button className="back-button" onClick={goBack}><FaArrowLeft /> Back</button>
                                <h2>Expense Claim Details</h2>
                            </div>
                            <ExpenseForm expense={selectedExpense} onSubmit={handleExpenseSubmit} onCancel={goBack} readOnly={readOnlyExp} currentUser={currentUser} />
                        </div>
                    );
                case 'NewExpenseForm':
                    if (!canAccess(PERMISSIONS.CREATE_EXPENSE, currentUser)) return <div className="full-screen-content">Access Denied to Create Expense Claim</div>;
                    return (
                        <div className="full-screen-view">
                            <div className="full-screen-header">
                                <button className="back-button" onClick={goBack}><FaArrowLeft /> Back</button>
                                <h2>Create New Expense Claim</h2>
                            </div>
                            <ExpenseForm expense={{ status: 'DRAFT' }} onSubmit={handleExpenseSubmit} onCancel={goBack} readOnly={false} currentUser={currentUser} />
                        </div>
                    );

                case 'UsersList':
                    if (!canAccess(PERMISSIONS.MANAGE_USERS, currentUser)) return <div className="main-content">Access Denied to User Management</div>;
                    return <UsersList navigate={navigate} currentUser={currentUser} users={users} />;
                case 'UserDetail':
                    if (!screenId) return <div className="full-screen-content">User not found.</div>;
                    const selectedUser = users.find(user => user.id === screenId);
                    if (!selectedUser) return <div className="full-screen-content">User {screenId} not found.</div>;
                    if (!canAccess(PERMISSIONS.MANAGE_USERS, currentUser)) return <div className="full-screen-content">Access Denied to User Details</div>;
                    return (
                        <div className="full-screen-view">
                            <div className="full-screen-header">
                                <button className="back-button" onClick={goBack}><FaArrowLeft /> Back</button>
                                <h2>User Profile</h2>
                            </div>
                            <UserDetail user={selectedUser} onSave={handleUserSave} onCancel={goBack} currentUser={currentUser} />
                        </div>
                    );

                case 'AuditLogsList':
                    if (!canAccess(PERMISSIONS.VIEW_AUDIT_LOGS, currentUser)) return <div className="main-content">Access Denied to Audit Logs</div>;
                    return <AuditLogsList navigate={navigate} currentUser={currentUser} auditLogs={auditLogs} />;

                default:
                    return <div className="main-content"><h2>Page Not Found</h2><p>The requested page does not exist.</p></div>;
            }
        };

        return (
            <div className="app-container">
                <div className="sidebar">
                    <div className="sidebar-header">
                        <FaPlaneDeparture className="logo" />
                        <h2>TravelDesk</h2>
                    </div>
                    <nav className="sidebar-nav">
                        {canAccess(PERMISSIONS.DASHBOARD_ADMIN, currentUser) && (
                            <li className="sidebar-nav-item">
                                <button onClick={() => navigate('Dashboard')} className={currentScreen.name === 'Dashboard' && currentUser.role === USER_ROLES.ADMIN ? 'active' : ''}>
                                    <FaChartLine className="icon" /> Admin Dashboard
                                </button>
                            </li>
                        )}
                        {canAccess(PERMISSIONS.DASHBOARD_EMPLOYEE, currentUser) && (
                            <li className="sidebar-nav-item">
                                <button onClick={() => navigate('Dashboard')} className={currentScreen.name === 'Dashboard' && currentUser.role === USER_ROLES.EMPLOYEE ? 'active' : ''}>
                                    <FaChartLine className="icon" /> My Dashboard
                                </button>
                            </li>
                        )}
                        {canAccess(PERMISSIONS.DASHBOARD_MANAGER, currentUser) && (
                            <li className="sidebar-nav-item">
                                <button onClick={() => navigate('Dashboard')} className={currentScreen.name === 'Dashboard' && currentUser.role === USER_ROLES.MANAGER ? 'active' : ''}>
                                    <FaChartLine className="icon" /> Manager Dashboard
                                </button>
                            </li>
                        )}
                        {canAccess(PERMISSIONS.DASHBOARD_FINANCE, currentUser) && (
                            <li className="sidebar-nav-item">
                                <button onClick={() => navigate('Dashboard')} className={currentScreen.name === 'Dashboard' && currentUser.role === USER_ROLES.FINANCE ? 'active' : ''}>
                                    <FaChartLine className="icon" /> Finance Dashboard
                                </button>
                            </li>
                        )}

                        {(canAccess(PERMISSIONS.VIEW_TRAVEL_REQUESTS_ALL, currentUser) || canAccess(PERMISSIONS.VIEW_TRAVEL_REQUESTS_OWN, currentUser)) && (
                            <li className="sidebar-nav-item">
                                <button onClick={() => navigate('TravelRequestsList')} className={currentScreen.name === 'TravelRequestsList' ? 'active' : ''}>
                                    <FaPlaneDeparture className="icon" /> Travel Requests
                                </button>
                            </li>
                        )}
                        {(canAccess(PERMISSIONS.VIEW_EXPENSES_ALL, currentUser) || canAccess(PERMISSIONS.VIEW_EXPENSES_OWN, currentUser) || canAccess(PERMISSIONS.VIEW_EXPENSES_TEAM, currentUser)) && (
                            <li className="sidebar-nav-item">
                                <button onClick={() => navigate('ExpensesList')} className={currentScreen.name === 'ExpensesList' ? 'active' : ''}>
                                    <FaFileInvoiceDollar className="icon" /> Expense Claims
                                </button>
                            </li>
                        )}
                        {canAccess(PERMISSIONS.MANAGE_USERS, currentUser) && (
                            <li className="sidebar-nav-item">
                                <button onClick={() => navigate('UsersList')} className={currentScreen.name === 'UsersList' ? 'active' : ''}>
                                    <FaUsers className="icon" /> User Management
                                </button>
                            </li>
                        )}
                        {canAccess(PERMISSIONS.VIEW_AUDIT_LOGS, currentUser) && (
                            <li className="sidebar-nav-item">
                                <button onClick={() => navigate('AuditLogsList')} className={currentScreen.name === 'AuditLogsList' ? 'active' : ''}>
                                    <FaHistory className="icon" /> Audit Logs
                                </button>
                            </li>
                        )}
                    </nav>
                    <div className="sidebar-footer">
                        <button onClick={logout}><FaSignOutAlt /> Logout</button>
                    </div>
                </div>

                {screenName === 'Dashboard' || screenName.endsWith('List') ? screenContent() : null}

                {screenName !== 'Dashboard' && !screenName.endsWith('List') && screenContent()}

                {showGlobalSearch && canAccess(PERMISSIONS.GLOBAL_SEARCH, currentUser) && (
                    <div className="global-search-overlay" onClick={() => setShowGlobalSearch(false)}>
                        <div className="global-search-container" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                className="global-search-input"
                                placeholder="Search all records..."
                                value={globalSearchTerm}
                                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                                autoFocus
                            />
                            {globalSearchTerm.length > 2 && globalSearchResults.length > 0 && (
                                <div className="search-results">
                                    {globalSearchResults.map(result => (
                                        <div key={result.id} className="search-result-item" onClick={result.onClick}>
                                            <span className="icon">{result.icon}</span>
                                            <span className="title">{result.title}</span>
                                            <span className="meta">({result.type} - <StatusBadge status={result.status} />)</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {globalSearchTerm.length > 2 && globalSearchResults.length === 0 && (
                                <div className="text-center text-muted" style={{ padding: 'var(--spacing-md)' }}>No results found for "{globalSearchTerm}"</div>
                            )}
                        </div>
                    </div>
                )}
                {canAccess(PERMISSIONS.GLOBAL_SEARCH, currentUser) && (
                    <button
                        className="btn-primary"
                        onClick={() => setShowGlobalSearch(true)}
                        style={{ position: 'fixed', bottom: 'var(--spacing-xl)', right: 'var(--spacing-xl)', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                        title="Global Search"
                    >
                        <FaSearch style={{ fontSize: 'var(--font-size-lg)' }} />
                    </button>
                )}

                <div className="toast-container">
                    {notifications.map(n => (
                        <Toast key={n.id} message={n.message} type={n.type} onClose={() => removeNotification(n.id)} />
                    ))}
                </div>
            </div>
        );
    };

    return renderScreen();
};

export default App;