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
import { Typography, Button } from '@mui/material';

import Cell from './Cell';
import { useAlerts } from '../../../Context/AlertsContext';
import { classifyAlert, classifyAlerts } from '../../../utils/alertClassifier';
import putAlertInMatrix from '../../../utils/putAlertInMatrix';
import getMaxPriortyAlert from '../../../utils/getMaxPriortyAlert';
import BusinessUnit from './BusinessUnit';
import { removeEnvironmentFromBoardByName } from '../../../utils/removeCustomerFromBoardByName';
import { addEnvironmentToBoardByName } from '../../../utils/addEnvironmentToBoardByName';

const keyOf = (metric, env) =>
    `${String(metric).toLowerCase()}__${String(env).toLowerCase()}`;

const priorityRank = { P1: 1, P2: 2, P3: 3, P4: 4 };
const getWorstPriority = (alerts = []) => {
    const priorities = alerts
        .map((a) => classifyAlert(a)?.priority)
        .filter(Boolean);

    if (priorities.length === 0) return null;

    return priorities.sort(
        (a, b) => (priorityRank[a] ?? 999) - (priorityRank[b] ?? 999),
    )[0];
};

const Board = ({ board, loading, error }) => {
    const [classification, setClassification] = useState(null);
    const [alertmat, setAlertmat] = useState([]);
    const [alertsByCell, setAlertsByCell] = useState({});

    // ✅ local environments state so UI updates when we add/remove
    const [envs, setEnvs] = useState(board?.environments || []);
    const metrics = board?.metrics || [];

    const { alerts, isConnected, clearAlerts } = useAlerts();

    useEffect(() => {
        // if board changes (e.g. parent refetch), sync envs
        setEnvs(board?.environments || []);
    }, [board]);

    useEffect(() => {
        if (!board) return;
        if (!Array.isArray(alerts) || alerts.length === 0) return;

        const classified = classifyAlerts(alerts);
        setClassification(classified);

        const alertmats = putAlertInMatrix(envs, metrics, classified);
        setAlertmat(alertmats);

        console.log('Alert Matrix:', alertmats);
        console.log('Classified alerts (array):', classified);

        clearAlerts();
    }, [alerts, board, envs, metrics, clearAlerts]);

    const handleCellClick = (metric, env) => {
        const cellAlerts = alertsByCell[keyOf(metric, env)] || [];
        console.log('Cell clicked', metric, env, cellAlerts);
    };

    const handleRemoveEnv = async (env) => {
        try {
            const updatedBoard = await removeEnvironmentFromBoardByName(
                board._id,
                env,
            );
            setEnvs(updatedBoard.environments || []);
        } catch (e) {
            console.error('Failed to remove environment:', e);
            alert(e.message || 'Failed to remove environment');
        }
    };

    const handleAddEnv = async () => {
        const name = window.prompt('Enter environment name (e.g. NG-LOT):');
        if (!name) return;

        const trimmed = name.trim();
        if (!trimmed) return;

        try {
            const updatedBoard = await addEnvironmentToBoardByName(
                board._id,
                trimmed,
            );
            setEnvs(updatedBoard.environments || []);
        } catch (e) {
            console.error('Failed to add environment:', e);
            alert(e.message || 'Failed to add environment');
        }
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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                }}
            >
                <Typography variant="h5" fontWeight={700}>
                    {board.name || 'Business Units'}
                </Typography>

                {/* ✅ Add Environment button */}
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddEnv}
                    style={{ backgroundColor: "orange" }}
                >
                    + Add Environment
                </Button>
            </Box>

            <Table size="small" aria-label="boards table">
                <TableHead>
                    <TableRow>
                        <TableCell>Metric</TableCell>
                        {envs.map((env, idx) => (
                            <TableCell
                                key={idx}
                                onClick={() => handleRemoveEnv(env)}
                                sx={{ cursor: 'pointer' }}
                            >
                                {env}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {metrics.map((metric, rowIndex) => (
                        <TableRow key={rowIndex}>
                            <TableCell>{metric}</TableCell>

                            {envs.map((env) => {
                                console.log('Classification:', classification);
                                const arr = (classification || []).filter(
                                    (a) => a.env === env && a.metric === metric
                                );

                                const cellKey = keyOf(metric, env);
                                const cellAlerts = alertsByCell[cellKey] || [];
                                const worstPriority =
                                    getWorstPriority(cellAlerts);

                                return (
                                    <Cell
                                        boardsId={board._id}
                                        key={cellKey}
                                        metric={metric}
                                        env={env}
                                        alerts={cellAlerts}
                                        count={cellAlerts.length}
                                        value={getMaxPriortyAlert(arr)}
                                        onClick={() =>
                                            handleCellClick(metric, env)
                                        }
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

export default Board;
