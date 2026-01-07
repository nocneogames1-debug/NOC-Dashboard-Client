import React, { useState } from 'react';
import HomeHeader from './Components/HomeHeader';
import Boards from './Components/Boards';

import {
    Box,
    Button,
    Typography,
    Alert,
    Stack,
    Paper,
} from '@mui/material';

const Home = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);
    const [lastCreatedBoard, setLastCreatedBoard] = useState(null);

    const handleCreateBoard = async () => {
        setIsCreating(true);
        setError(null);
        setLastCreatedBoard(null);

        try {
            const response = await fetch('http://localhost:4000/boards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: `Board-${Date.now()}`, // simple unique name
                    description: 'Auto-created board from Home page',
                    isDefault: false,
                    environments: [
                        'VAL',
                        'NHL',
                        'NCEL',
                        'MSL',
                        'WV',
                        'SAZKA',
                        'AGLC',
                        'US-LOT',
                        'NG-LOT',
                    ],
                    metrics: ['Bets', 'Logins', 'Deposits', 'Performance'],
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(
                    `Failed to create board: ${response.status} ${response.statusText} - ${text}`,
                );
            }

            const created = await response.json();
            console.log('Created board:', created);
            setLastCreatedBoard(created);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create board');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Box>
            {/* <HomeHeader />

            <Box component="main" sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome to Home
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    This is the home page.
                </Typography>

                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        mb: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        maxWidth: 500,
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateBoard}
                            disabled={isCreating}
                        >
                            {isCreating ? 'Creating board…' : 'Create Board'}
                        </Button>
                    </Stack>

                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    {lastCreatedBoard && (
                        <Alert severity="success">
                            Created board:&nbsp;
                            <strong>{lastCreatedBoard.name}</strong>
                        </Alert>
                    )}
                </Paper> */}

            <Boards />
        </Box>

    );
};

export default Home;
