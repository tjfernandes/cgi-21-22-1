attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;
uniform float point_size;

void main()
{
    gl_PointSize = point_size;
    gl_Position = vPosition;
    gl_Position.x = gl_Position.x / (table_width/2.0);
    gl_Position.y = gl_Position.y / (table_height/2.0);    
}
