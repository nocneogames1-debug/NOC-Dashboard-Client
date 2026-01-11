import { useState } from "react";
import { Grid, Stack, Button, IconButton, Collapse } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

export default function BoardsActions({
    handleOpenCreate,
    handleOpenCreateTag,
    tagsLoading,
    tags,
}) {
    const [open, setOpen] = useState(false);

    return (
        <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2, px: 2 }} // padding added here
        >
            <Grid item>
                <IconButton
                    onClick={() => setOpen((prev) => !prev)}
                    sx={{
                        bgcolor: "orange",
                        color: "#000",
                        "&:hover": { bgcolor: "#ff9800" },
                    }}
                >
                    {open ? <CloseIcon /> : <AddIcon />}
                </IconButton>
            </Grid>

            <Grid item>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            size="small"
                            sx={{ bgcolor: "orange" }}
                            onClick={handleOpenCreate}
                        >
                            + Add Board
                        </Button>

                        <Button
                            variant="contained"
                            size="small"
                            sx={{ bgcolor: "orange" }}
                            onClick={handleOpenCreateTag}
                            disabled={tagsLoading && !tags}
                        >
                            + Add Tag
                        </Button>
                    </Stack>
                </Collapse>
            </Grid>
        </Grid>
    );
}
