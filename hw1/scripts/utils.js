export const NUMBER_OF_SQUARES_IN_A_ROW = 30;
export const INITIAL_COLOR = [0.0, 0.0, 0.0];

export const getCoordinatesOfIsoscelesTriangles = (x_start, y_start, x_end, y_end) => {
    return [
        // top triangle
        x_start, y_start, 0,
        x_end, y_start, 0,
        (x_start + x_end)/2, (y_start + y_end)/2, 0,

        // left triangle
        x_start, y_start, 0,
        (x_start + x_end)/2, (y_start + y_end)/2, 0,
        x_start, y_end, 0,

        // bottom triangle
        x_start, y_end, 0,
        x_end, y_end, 0,
        (x_start + x_end)/2, (y_start + y_end)/2, 0,   

        // right triangle
        x_end, y_start, 0,
        x_end, y_end, 0,
        (x_start + x_end)/2, (y_start + y_end)/2, 0,
    ]
}



export const getRelativeIsoscelesTriangleIndex = (x_event, y_event) => {
    x_event_relative = x_event * NUMBER_OF_SQUARES_IN_A_ROW;
    y_event_relative = y_event * NUMBER_OF_SQUARES_IN_A_ROW;

    triangle_x_start_index_relative = Math.floor(x_event_relative);
    triangle_y_start_index_relative = Math.floor(y_event_relative);

    

}