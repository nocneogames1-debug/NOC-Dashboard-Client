import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import HomeHeader from './Components/HomeHeader';
import Board from './Components/Boards';

import {
    Box,
    Typography,
    Alert,
    Stack,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Paper,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';

import TagsContext from '../../Context/TagsContext';
import BoardsActions from './Components/BoardActions';

const normalizeToken = (s) => String(s || '').trim();

const uniquePush = (arr, value) => {
    const v = normalizeToken(value);
    if (!v) return arr;
    if (arr.includes(v)) return arr;
    return [...arr, v];
};

const Home = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🔹 Add Board dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');

    // ✅ NEW: environments/metrics as lists + single-value inputs
    const [environmentsList, setEnvironmentsList] = useState([]);
    const [metricsList, setMetricsList] = useState([]);
    const [envInput, setEnvInput] = useState('');
    const [metricInput, setMetricInput] = useState('');

    // ✅ Tags context
    const {
        tags,
        loading: tagsLoading,
        error: tagsError,
        isAdding,
        addTag,
        refreshTags,
    } = useContext(TagsContext);

    // 🔹 Add Tag dialog
    const [createTagOpen, setCreateTagOpen] = useState(false);
    const [selectedDictionary, setSelectedDictionary] = useState('');
    const [tagKey, setTagKey] = useState('');
    const [tagValues, setTagValues] = useState('');
    const [tagPlaceHolderValue, setTagPlaceHolderValue] = useState('');

    // ✅ list dictionary names
    const dictionaryNames = useMemo(() => {
        if (!tags) return [];
        if (Array.isArray(tags)) return tags.map((d) => d?.name).filter(Boolean);
        if (typeof tags === 'object') return Object.keys(tags);
        return [];
    }, [tags]);

    // ✅ Extract entries for selected dictionary (resilient to common shapes)
    const selectedDictEntries = useMemo(() => {
        if (!tags || !selectedDictionary) return {};

        if (Array.isArray(tags)) {
            const dictObj = tags.find((d) => d?.name === selectedDictionary);
            if (!dictObj) return {};
            const maybeEntries =
                dictObj.entries ||
                dictObj.data ||
                dictObj.dictionary ||
                dictObj.value ||
                dictObj.payload;

            if (maybeEntries && typeof maybeEntries === 'object') {
                if (maybeEntries.entries && typeof maybeEntries.entries === 'object') return maybeEntries.entries;
                return maybeEntries;
            }
            return {};
        }

        const dictObj = tags[selectedDictionary];
        if (!dictObj) return {};
        if (typeof dictObj === 'object' && !Array.isArray(dictObj)) {
            if (dictObj.entries && typeof dictObj.entries === 'object') return dictObj.entries;
            if (dictObj.data && typeof dictObj.data === 'object') return dictObj.data;
            return dictObj;
        }
        return {};
    }, [tags, selectedDictionary]);

    // ✅ Keys list for UI
    const selectedDictKeys = useMemo(() => {
        const entries = selectedDictEntries || {};
        return Object.keys(entries).sort((a, b) => a.localeCompare(b));
    }, [selectedDictEntries]);

    const fetchBoards = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(process.env.REACT_APP_API_URL + '/boards');
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to load boards: ${res.status} ${res.statusText} - ${text}`);
            }

            const data = await res.json();
            const normalized = Array.isArray(data) ? data : data ? [data] : [];
            setBoards(normalized);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to load board');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    // 🔹 Open/close Board dialog
    const handleOpenCreate = () => setCreateOpen(true);

    const handleCloseCreate = () => {
        setCreateOpen(false);
        setNewBoardName('');
        setNewBoardDescription('');

        // ✅ reset list-style inputs
        setEnvironmentsList([]);
        setMetricsList([]);
        setEnvInput('');
        setMetricInput('');
    };

    const addEnvironment = useCallback(() => {
        setEnvironmentsList((prev) => uniquePush(prev, envInput));
        setEnvInput('');
    }, [envInput]);

    const addMetric = useCallback(() => {
        setMetricsList((prev) => uniquePush(prev, metricInput));
        setMetricInput('');
    }, [metricInput]);

    const handleEnvKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEnvironment();
        }
    };

    const handleMetricKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addMetric();
        }
    };

    // 🔹 Create board handler
    const handleCreateBoard = async () => {
        if (!newBoardName.trim()) {
            setError('Board name is required');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload = {
                name: newBoardName.trim(),
                description: newBoardDescription.trim() || undefined,
                environments: environmentsList,
                metrics: metricsList,
            };

            const res = await fetch(process.env.REACT_APP_API_URL + '/boards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to create board: ${res.status} ${res.statusText} - ${text}`);
            }

            const created = await res.json();
            setBoards((prev) => [...prev, created]);
            handleCloseCreate();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create board');
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Open/close Tag dialog
    const handleOpenCreateTag = () => {
        setCreateTagOpen(true);
        setError(null);
        if (!selectedDictionary && dictionaryNames.length) setSelectedDictionary(dictionaryNames[0]);
    };

    const handleCloseCreateTag = () => {
        setCreateTagOpen(false);
        setSelectedDictionary('');
        setTagKey('');
        setTagValues('');
    };

    // 🔹 Add Tag handler
    const handleSubmitTag = async () => {
        if (!selectedDictionary) {
            setError('Please choose a dictionary');
            return;
        }
        if (!tagKey.trim()) {
            setError('Tag key is required');
            return;
        }

        const valuesArray = tagValues
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);

        try {
            setError(null);
            await addTag(selectedDictionary, tagPlaceHolderValue);

            // If backend doesn't return updated state, uncomment:
            // await refreshTags();

            handleCloseCreateTag();
        } catch (e) {
            console.error(e);
        }
    };

    // ✅ Clicking a key fills inputs (for edit/overwrite use-case)
    const handlePickExistingKey = (key) => {
        setTagKey(key);
        const values = selectedDictEntries?.[key];
        if (Array.isArray(values)) setTagValues(values.join(', '));
        else if (typeof values === 'string') setTagValues(values);
        else setTagValues('');
    };

    return (
        <Box>
            {/* Optional header */}
            {/* <HomeHeader /> */}

            <BoardsActions handleOpenCreate={handleOpenCreate}/>

            <Stack spacing={2} sx={{ mb: 2 }}>
                {loading && <CircularProgress size={24} />}
                {error && <Alert severity="error">{error}</Alert>}
            </Stack>

            {boards.length === 0 && !loading && !error && <Typography>No boards found.</Typography>}

            {boards.map((b) => (
                <Board key={b._id || b.id} board={b} loading={loading} error={error} />
            ))}

            {/* 🔹 Add Board Dialog (UPDATED: show values above, add single value input) */}
            <Dialog open={createOpen} onClose={handleCloseCreate} fullWidth maxWidth="sm">
                <DialogTitle>Create New Board</DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        margin="normal"
                        label="Board Name"
                        fullWidth
                        required
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                    />

                    <TextField
                        margin="normal"
                        label="Description"
                        fullWidth
                        value={newBoardDescription}
                        onChange={(e) => setNewBoardDescription(e.target.value)}
                    />

                    {/* ✅ Environments section */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Environments
                        </Typography>

                        <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {environmentsList.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No environments added yet.
                                    </Typography>
                                ) : (
                                    environmentsList.map((env) => (
                                        <Chip
                                            key={env}
                                            label={env}
                                            onDelete={() => setEnvironmentsList((prev) => prev.filter((x) => x !== env))}
                                            sx={{ mb: 1 }}
                                        />
                                    ))
                                )}
                            </Stack>
                        </Paper>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                label="Add environment"
                                fullWidth
                                value={envInput}
                                onChange={(e) => setEnvInput(e.target.value)}
                                onKeyDown={handleEnvKeyDown}
                                placeholder="Type value and press Enter"
                            />
                            <IconButton
                                aria-label="add environment"
                                onClick={addEnvironment}
                                disabled={!normalizeToken(envInput)}

                            >
                                <AddIcon />
                            </IconButton>
                        </Stack>
                    </Box>

                    {/* ✅ Metrics section */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Metrics
                        </Typography>

                        <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {metricsList.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No metrics added yet.
                                    </Typography>
                                ) : (
                                    metricsList.map((m) => (
                                        <Chip
                                            key={m}
                                            label={m}
                                            onDelete={() => setMetricsList((prev) => prev.filter((x) => x !== m))}
                                            sx={{ mb: 1 }}
                                        />
                                    ))
                                )}
                            </Stack>
                        </Paper>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                label="Add metric"
                                fullWidth
                                value={metricInput}
                                onChange={(e) => setMetricInput(e.target.value)}
                                onKeyDown={handleMetricKeyDown}
                                placeholder="Type value and press Enter"
                            />
                            <IconButton
                                aria-label="add metric"
                                onClick={addMetric}
                                disabled={!normalizeToken(metricInput)}
                            >
                                <AddIcon />
                            </IconButton>
                        </Stack>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseCreate} style={{ backgroundColor: "orange" }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateBoard} style={{ backgroundColor: "orange" }}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ✅ 🔹 Add Tag Dialog (with Keys list) */}
            <Dialog open={createTagOpen} onClose={handleCloseCreateTag} fullWidth maxWidth="sm">
                <DialogTitle>Add Tag</DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2}>
                        {(tagsLoading || !tags) && <Alert severity="info">Loading dictionaries...</Alert>}
                        {tagsError && <Alert severity="error">{tagsError}</Alert>}

                        <Divider />

                        <FormControl fullWidth disabled={!dictionaryNames.length}>
                            <InputLabel id="dictionary-select-label">Dictionary</InputLabel>
                            <Select
                                labelId="dictionary-select-label"
                                label="Dictionary"
                                value={selectedDictionary}
                                onChange={(e) => {
                                    setSelectedDictionary(e.target.value);
                                    setTagKey('');
                                    setTagValues('');
                                }}
                            >
                                {dictionaryNames.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Accordion defaultExpanded={false} disabled={!selectedDictionary}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={600}>
                                    Existing Keys ({selectedDictKeys.length})
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {!selectedDictionary ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Choose a dictionary to see its keys.
                                    </Typography>
                                ) : selectedDictKeys.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No keys found for this dictionary.
                                    </Typography>
                                ) : (
                                    <List dense sx={{ maxHeight: 220, overflow: 'auto', borderRadius: 1 }}>
                                        {selectedDictKeys.map((k) => {
                                            const values = selectedDictEntries?.[k];
                                            const valuesCount = Array.isArray(values) ? values.length : values ? 1 : 0;

                                            return (
                                                <ListItem
                                                    key={k}
                                                    button
                                                    onClick={() => handlePickExistingKey(k)}
                                                    sx={{ borderRadius: 1 }}
                                                >
                                                    <ListItemText
                                                        primary={k}
                                                        secondary={
                                                            Array.isArray(values)
                                                                ? values.slice(0, 3).join(', ') + (values.length > 3 ? '…' : '')
                                                                : typeof values === 'string'
                                                                    ? values
                                                                    : ''
                                                        }
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`${valuesCount} value${valuesCount === 1 ? '' : 's'}`}
                                                    />
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                )}
                            </AccordionDetails>
                        </Accordion>

                        <TextField
                            label="Key"
                            fullWidth
                            required
                            value={tagKey}
                            onChange={(e) => setTagKey(e.target.value)}
                            placeholder='Example: "US-LOT"'
                        />

                        <TextField
                            label="Values (comma separated)"
                            fullWidth
                            value={tagPlaceHolderValue}
                            onChange={(e) => setTagPlaceHolderValue(e.target.value)}
                        />

                        <Alert severity="success" variant="outlined">
                            <Typography variant="body2">
                                <b>Preview:</b> {selectedDictionary || '(choose dictionary)'} → {tagKey || '(key)'} = [
                                {tagValues
                                    .split(',')
                                    .map((v) => v.trim())
                                    .filter(Boolean)
                                    .join(', ')}
                                ]
                            </Typography>
                        </Alert>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseCreateTag}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitTag}
                        disabled={isAdding || !dictionaryNames.length}
                    >
                        {isAdding ? 'Adding...' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Home;
