export const NUMBER_OF_SQUARES_IN_A_ROW = 30;
export const INITIAL_COLOR = [1.0, 1.0, 1.0];

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
    const x_event_relative = x_event * NUMBER_OF_SQUARES_IN_A_ROW;
    const y_event_relative = y_event * NUMBER_OF_SQUARES_IN_A_ROW;

    const triangle_x_start_index_relative = Math.floor(x_event_relative);
    const triangle_y_start_index_relative = Math.floor(y_event_relative);

    // get the degree of angle between the mouse event and the center of the square
    const x_center_relative = triangle_x_start_index_relative + 0.5;
    const y_center_relative = triangle_y_start_index_relative + 0.5;

    const x_difference_relative = x_event_relative - x_center_relative;
    const y_difference_relative = y_event_relative - y_center_relative;

    const angle = Math.atan2(y_difference_relative, x_difference_relative);

    // top rectangle
    let triangle_inside_square_index = 0;
    if (y_difference_relative > 0) {
        if (x_difference_relative > 0) {
            if (angle >= Math.PI/4) {
                triangle_inside_square_index = 2;
            } else {
                triangle_inside_square_index = 3;
            }
        } else {
            if (angle >= Math.PI/4) {
                triangle_inside_square_index = 2;
            } else {
                triangle_inside_square_index = 1;
            }
        }
    } else {        // bottom rectangle
        if (x_difference_relative > 0) {
            if (angle >= Math.PI/4) {
                triangle_inside_square_index = 0;
            } else {
                triangle_inside_square_index = 3;
            }
        } else {
            if (angle >= Math.PI/4) {
                triangle_inside_square_index = 0;
            } else {
                triangle_inside_square_index = 1;
            }
        }
    }

    let result = triangle_inside_square_index + 120 * (triangle_y_start_index_relative ) + 4 * triangle_x_start_index_relative;

    if (result < 0) return 0;
    if (result > 4 * NUMBER_OF_SQUARES_IN_A_ROW * NUMBER_OF_SQUARES_IN_A_ROW - 1) return 4 * NUMBER_OF_SQUARES_IN_A_ROW * NUMBER_OF_SQUARES_IN_A_ROW - 1;
    
    return result
}