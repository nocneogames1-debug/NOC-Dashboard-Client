import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import Cell from './Cell';
import { useAlerts } from '../../../Context/AlertsContext';
import { classifyAlert, classifyAlerts } from '../../../utils/alertClassifier';
import putAlertInMatrix from '../../../utils/putAlertInMatrix';
import getMaxPriortyAlert from '../../../utils/getMaxPriortyAlert';

const keyOf = (metric, env) =>
    `${String(metric).toLowerCase()}__${String(env).toLowerCase()}`;

const priorityRank = { P1: 1, P2: 2, P3: 3, P4: 4 };
const getWorstPriority = (alerts = []) => {
    const priorities = alerts
        .map((a) => classifyAlert(a)?.priority)
        .filter(Boolean);

    if (priorities.length === 0) return null;

    // P1 is worst => smallest rank
    return priorities.sort(
        (a, b) => (priorityRank[a] ?? 999) - (priorityRank[b] ?? 999),
    )[0];
};

const Boards = () => {
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [classification, setClassification] = useState(null);
    const { alerts, isConnected, clearAlerts } = useAlerts();
    const [alertmat, setAlertmat] = useState([]);
    // metric__env -> alerts[]
    const [alertsByCell, setAlertsByCell] = useState({});

    // fetch board from backend
    useEffect(() => {
        const fetchBoard = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch('http://localhost:4000/boards');
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(
                        `Failed to load boards: ${res.status} ${res.statusText} - ${text}`,
                    );
                }

                const boards = await res.json();
                const defaultBoard = boards.find((b) => b.isDefault) ?? boards[0];
                setBoard(defaultBoard || null);
            } catch (err) {
                console.error(err);
                setError(err.message || 'Failed to load board');
            } finally {
                setLoading(false);
            }
        };

        fetchBoard();
    }, []);

    const environments = board?.environments || [];
    const metrics = board?.metrics || [];

    // consume alerts and bucket them into metric×env cells
    useEffect(() => {
        if (!board) return;
        if (!Array.isArray(alerts) || alerts.length === 0) return;

        // optional debug
        const classified = classifyAlerts(alerts);
        setClassification(classified);
        const alertmats = putAlertInMatrix(environments, metrics, classified);
        setAlertmat(alertmats);
        console.log('Alert Matrix:', alertmat);
        console.log('Classified alerts (array):', classification);
        clearAlerts();

    }, [alerts, board, metrics, environments, clearAlerts]);

    const handleCellClick = (metric, env) => {
        const cellAlerts = alertsByCell[keyOf(metric, env)] || [];

    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 3,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <TableContainer component={Paper} elevation={2}>
                <Box sx={{ p: 2, color: 'error.main' }}>{error}</Box>
            </TableContainer>
        );
    }

    if (!board) {
        return (
            <TableContainer component={Paper} elevation={2}>
                <Box sx={{ p: 2 }}>No board found.</Box>
            </TableContainer>
        );
    }

    return (
        <TableContainer component={Paper} elevation={2}>
            <Table size="small" aria-label="boards table">
                <TableHead>
                    <TableRow>
                        <TableCell>Metric</TableCell>
                        {environments.map((env, idx) => (
                            <TableCell key={idx}>{env}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {metrics.map((metric, rowIndex) => (
                        <TableRow key={rowIndex}>
                            <TableCell>{metric}</TableCell>

                            {environments.map((env) => {
                                let arr = (classification || []).filter(
                                    (a) => a.env === env && a.metric === metric
                                );
                                console.log(arr);
                                console.log(getMaxPriortyAlert(arr))
                                const cellKey = keyOf(metric, env);
                                const cellAlerts = alertsByCell[cellKey] || [];
                                const worstPriority = getWorstPriority(cellAlerts);

                                return (
                                    <Cell
                                        key={cellKey}
                                        metric={metric}
                                        env={env}
                                        alerts={cellAlerts}
                                        count={cellAlerts.length}
                                        value={getMaxPriortyAlert(arr)}
                                        onClick={() => handleCellClick(metric, env)}
                                    />
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default Boards;
