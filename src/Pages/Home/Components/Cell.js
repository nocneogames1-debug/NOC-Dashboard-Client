import React from 'react'
import TableCell from '@mui/material/TableCell'
import Box from '@mui/material/Box'
import { computeHeadingLevel } from '@testing-library/dom'

const colorFor = (val) => {
    switch (val) {
        case 'P1':
            return '#ff5252' // red
        case 'P2':
            return '#ff9a3c' // orange
        case 'P3':
            return '#ffea4d' // yellow
        case 'P4':
            return '#7ee37e' // green
        case undefined:
            return '#7ee37e' // green    
        default:
            return "#7ee37e'"
    }
}

const Cell = ({ value, onClick }) => {
    const bg = colorFor(value)
    console.log(value)
    return (
        <TableCell
            onClick={onClick}
            sx={{
                cursor: 'pointer',
                backgroundColor: bg,
                border: '1px solid #cfcfcf',
            }}
        >
            <Box sx={{ p: '20px' }} />
        </TableCell>
    )
}

export default Cell
