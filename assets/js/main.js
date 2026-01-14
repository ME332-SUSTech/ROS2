// 主要功能脚本
document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 示例代码标签切换
    window.showExample = function(language) {
        // 隐藏所有示例内容
        document.querySelectorAll('.example-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // 移除所有按钮的活动状态
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 显示选中的内容和按钮
        const selectedContent = document.getElementById(`${language}-example`);
        const selectedButton = event.target;
        
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
    };

    // 教程加载功能
    window.loadTutorial = function(tutorialName) {
        const tutorials = {
            'first-node': {
                title: '创建你的第一个节点',
                content: `
                    <h3>创建Python节点</h3>
                    <p>让我们创建一个简单的ROS2节点：</p>
                    <div class="code-block">
                        <pre><code class="python">#!/usr/bin/env python3
import rclpy
from rclpy.node import Node

class MyFirstNode(Node):
    def __init__(self):
        super().__init__('my_first_node')
        self.get_logger().info('Hello from ROS2!')
        
def main(args=None):
    rclpy.init(args=args)
    node = MyFirstNode()
    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()</code></pre>
                    </div>
                    <h3>运行节点</h3>
                    <div class="code-block">
                        <pre><code class="bash"># 设置ROS2环境
source /opt/ros/humble/setup.bash

# 运行节点
python3 my_first_node.py</code></pre>
                    </div>
                `
            },
            'pubsub': {
                title: '发布者和订阅者',
                content: `
                    <h3>发布者节点</h3>
                    <div class="code-block">
                        <pre><code class="python">import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SimplePublisher(Node):
    def __init__(self):
        super().__init__('simple_publisher')
        self.publisher_ = self.create_publisher(String, 'hello_topic', 10)
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.count = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello ROS2! Count: {self.count}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Published: {msg.data}')
        self.count += 1</code></pre>
                    </div>
                    <h3>订阅者节点</h3>
                    <div class="code-block">
                        <pre><code class="python">import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SimpleSubscriber(Node):
    def __init__(self):
        super().__init__('simple_subscriber')
        self.subscription = self.create_subscription(
            String, 'hello_topic', self.listener_callback, 10)

    def listener_callback(self, msg):
        self.get_logger().info(f'Received: {msg.data}')</code></pre>
                    </div>
                `
            },
            'service': {
                title: '服务和客户端',
                content: `
                    <h3>服务端</h3>
                    <div class="code-block">
                        <pre><code class="python">import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class SimpleService(Node):
    def __init__(self):
        super().__init__('simple_service')
        self.srv = self.create_service(
            AddTwoInts, 'add_two_ints', self.add_two_ints_callback)

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Request: {request.a} + {request.b} = {response.sum}')
        return response</code></pre>
                    </div>
                    <h3>客户端</h3>
                    <div class="code-block">
                        <pre><code class="python">import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class SimpleClient(Node):
    def __init__(self):
        super().__init__('simple_client')
        self.client = self.create_client(AddTwoInts, 'add_two_ints')
        
    def send_request(self, a, b):
        request = AddTwoInts.Request()
        request.a = a
        request.b = b
        future = self.client.call_async(request)
        return future</code></pre>
                    </div>
                `
            },
            'parameters': {
                title: '参数和配置',
                content: `
                    <h3>使用参数的节点</h3>
                    <div class="code-block">
                        <pre><code class="python">import rclpy
from rclpy.node import Node
from rcl_interfaces.msg import ParameterDescriptor

class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')
        
        # 声明参数
        self.declare_parameter('my_parameter', 'default_value')
        self.declare_parameter('my_int_param', 42)
        
        # 创建参数回调
        self.add_on_set_parameters_callback(self.parameter_callback)
        
        # 定时器获取参数值
        self.timer = self.create_timer(2.0, self.timer_callback)
    
    def parameter_callback(self, params):
        for param in params:
            self.get_logger().info(f'Parameter {param.name} changed to: {param.value}')
        return SetParametersResult(successful=True)
    
    def timer_callback(self):
        param_value = self.get_parameter('my_parameter').get_parameter_value().string_value
        int_param = self.get_parameter('my_int_param').get_parameter_value().integer_value
        self.get_logger().info(f'Current params: {param_value}, {int_param}')</code></pre>
                    </div>
                    <h3>设置参数</h3>
                    <div class="code-block">
                        <pre><code class="bash"># 运行时设置参数
ros2 param set /parameter_node my_parameter "new_value"
ros2 param set /parameter_node my_int_param 100

# 查看参数
ros2 param list
ros2 param get /parameter_node my_parameter</code></pre>
                    </div>
                `
            }
        };

        const tutorial = tutorials[tutorialName];
        if (tutorial) {
            // 创建模态框显示教程内容
            showTutorialModal(tutorial);
        }
    };

    // 显示教程模态框
    function showTutorialModal(tutorial) {
        // 移除已存在的模态框
        const existingModal = document.querySelector('.tutorial-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // 创建新的模态框
        const modal = document.createElement('div');
        modal.className = 'tutorial-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${tutorial.title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${tutorial.content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 添加关闭事件
        const closeBtn = modal.querySelector('.modal-close');
        const modalContent = modal.querySelector('.modal-content');
        
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // 重新高亮代码
        hljs.highlightAll();
    }

    // 添加模态框样式
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .tutorial-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
        }
        
        .modal-content {
            background: white;
            border-radius: 15px;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px 15px 0 0;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }
        
        .modal-close:hover {
            background: rgba(255,255,255,0.2);
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-body h3 {
            color: #4a5568;
            margin: 1.5rem 0 1rem 0;
        }
        
        .modal-body p {
            margin-bottom: 1rem;
            line-height: 1.6;
        }
    `;
    document.head.appendChild(modalStyles);
});