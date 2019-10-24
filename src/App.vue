<template>
  <div id="app">
    <div class="left">
      <div class="gene">
        <span class="label">数组长度:</span>
        <div class="input-wrapper">
          <el-slider v-model="length" :min="1" :max="50" show-input></el-slider>
        </div>
        <el-button @click="generateRandomArray">生成随机数组</el-button>
      </div>
      <div class="arr">
        <div class="label">数组:</div>
        <div class="textarea">
          <el-input type="textarea" :rows="2" placeholder="键入数组" v-model="arrString"></el-input>
        </div>
      </div>
      <div class="method">
        <div class="label">算法选择:</div>
        <div class="btns">
          <div class="btn-wrapper" v-for="(method,index) in sortMethods" :key="method.id">
            <el-button type="primary" :plain="index !== methodIndex" :disabled="index > 5" @click="methodIndex = index">{{ method.name }}</el-button>
          </div>
        </div>
      </div>
      <div class="commit">
        <div class="label">操作:</div>
        <div class="btn-wrapper">
          <el-button type="success" round @click="startSort">开始排序</el-button>
          <el-button type="warning" round @click="reset">重置</el-button>
        </div>
      </div>
      <div class="speed">
        <div class="label">速度:</div>
        <el-slider v-model="delay" :min="0" :max="500"></el-slider>
      </div>
    </div>
    <div class="right">
      <div class="arr-panel">
        <div class="arr-list">
          <div
            class="item"
            v-for="item in sortArr"
            :key="item.id"
            :class="item.className"
            :style="{height:(item.value/max*100).toFixed(2) + '%'}"
            ref="item"
          >
            <div
              class="move"
              v-show="item.className.includes('act') || item.className.includes('down')"
              :style="{left:item.left + 'px'}"
            ></div>
          </div>
        </div>
      </div>
      <div class="message" v-show="show">{{ message }}</div>
    </div>
  </div>
</template>

<script>
import "./style/reset.css";
import sortMixin from "./mixin/sortMixin";
export default {
  mixins: [sortMixin],
  name: "App",
  created() {
    this.generateRandomArray();
  },
  mounted() {
    window.vm = this;
  },
  data() {
    return {
      length: 15,
      arr: [],
      sortArr: [],
      max: 0,
      arrString: "",
      sortMethods: [
        {
          id: 1,
          name: "冒泡排序",
          funcName: "bubbleSort"
        },
        {
          id: 2,
          name: "选择排序",
          funcName: "selectSort"
        },
        {
          id: 3,
          name: "插入排序",
          funcName: "insertSort"
        },
        {
          id: 4,
          name: "希尔排序",
          funcName: "shellSort"
        },
        {
          id: 5,
          name: "归并排序",
          funcName: "mergeSort"
        },
        {
          id: 6,
          name: "快速排序",
          funcName: "quickSort"
        },
        {
          id: 7,
          name: "堆排序",
          funcName: "heapSort"
        },
        {
          id: 8,
          name: "桶排序",
          funcName: "bucketSort"
        },
        {
          id: 9,
          name: "计数排序",
          funcName: "countingSort"
        },
        {
          id: 10,
          name: "基数排序",
          funcName: "radixSort"
        }
      ],
      methodIndex: 0, // 当前排序方法名
      delay: 300, //动画间隔
      show:false,
      message:''
    };
  },
  components: {},
  methods: {
    generateRandomArray() {
      setTimeout(() => {
        let arr = [],
          len = this.length,
          i;
        for (i = 0; i < len; i++) {
          arr[i] = Math.ceil(Math.random() * 100);
        }
        this.arr = arr;
        this.sortArr = this.wrapArr(arr);
        this.max = Math.max.apply(null, arr);
        this.arrString = `[${arr.join(", ")}]`;
        this.stop = false;
      }, 550);
    },
    wrapArr(arr) {
      return arr.map((item, index) => {
        return {
          id: index + 1,
          value: item,
          className: "",
          left: 0
        };
      });
    },
    reset() {
      this.stop = true;
      let arr;
      try {
        arr = JSON.parse(this.arrString);
      } catch (e) {
        alert("数组格式有误,请重新输入");
      }
      this.arr = arr;
      this.sortArr = this.wrapArr(arr);
      setTimeout(() => {
        this.stop = false;
      }, 500);
    },
    async startSort() {
      let sortGenerator = this[this.sortMethods[this.methodIndex].funcName](
        this.arr
      );
      let res = sortGenerator.next(),
        value;
      while (!res.done && !this.stop) {
        value = res.value;
        switch (value[0]) {
          case "active":
            await this.addClassAsync(value[1], "act");
            break;
          case "deactive":
            await this.removeClassAsync(value[1], "act");
            break;
          case "swap":
            await this.swapAnimation(value[1][0], value[1][1]);
            break;
          case "sorted":
            await this.addClassAsync(value[1], "ordered");
            break;
          case "down":
            await this.addClassAsync(value[1], "down");
            break;
          case "up":
            await this.removeClassAsync(value[1], "down");
            break;
          case "shell":
            await this.addClassAsync(value[1], "shell");
            break;
          case "unshell":
            await this.removeClassAsync(value[1], "shell");
            break;
          case "show":
            this.show = true;
            this.message = value[1];
            break;
          case "unshow":
            this.show = false;
            break;
          case "blur":
            await this.addClassAsync(value[1],'blur');
            break;
          case "unblur":
            await this.removeClassAsync(value[1],'blur');
            break;
          case "cur":
            await this.addClassAsync(value[1],'cur');
            break;
          case "uncur":
            await this.removeClassAsync(value[1],'cur');
            break;
        }
        res = sortGenerator.next();
      }
      this.stop = false;
    },
    addClass(indexs, className) {
      for (let i of indexs) {
        let name = this.sortArr[i].className.split(/\s+/);
        if (!name.includes(className)) {
          this.sortArr[i].className = [...name, className].join(" ");
        }
      }
    },
    addClassAsync(indexs, className) {
      this.addClass(indexs, className);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, this.delay);
      });
    },
    removeClass(indexs, className) {
      for (let i of indexs) {
        let name = this.sortArr[i].className.split(/\s+/),
          index = name.indexOf(className);
        if (index !== -1) {
          name.splice(index, 1);
          this.sortArr[i].className = name.join(" ");
        }
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, this.delay);
      });
    },
    removeClassAsync(indexs, className) {
      this.removeClass(indexs, className);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, this.delay);
      });
    },
    // 交换动画
    swapAnimation(i, j) {
      this.addClass([i, j], "act");
      let left1 = this.$refs.item[i].offsetLeft;
      let left2 = this.$refs.item[j].offsetLeft;
      return this.moveLeft(i, j, left2 - left1,Math.max(this.delay,100));
    },
    // 将i,j 位置元素, 向左移动到target 动画
    // i < j
    moveLeft(i, j, target, duration = 300, interval = 30) {
      return new Promise(resolve => {
        let times = Math.floor(duration / interval);
        let delta = target / times;
        if (this.timer) {
          // 清除上次影响
          clearInterval(this.timer);
          this.sortArr.forEach(ele => {
            ele.left = 0;
          });
        }
        this.timer = setInterval(() => {
          let res = this.sortArr[i].left + delta;
          if (res > target) {
            this.sortArr[i].left = target;
            this.sortArr[j].left = -target;
            clearInterval(this.timer);
            setTimeout(() => {
              let tmp = this.sortArr[i].value;
              this.sortArr[i].value = this.sortArr[j].value;
              this.sortArr[j].value = tmp;
              if (this.sortArr[j].className.indexOf("down") !== -1) {
                this.removeClass([j], "down");
                this.addClass([i], "down");
              }
              this.removeClass([i, j], "act");
              this.sortArr[i].left = this.sortArr[j].left = 0;
              resolve();
            }, this.delay);
          } else {
            this.sortArr[i].left = res;
            this.sortArr[j].left = -res;
          }
        }, interval);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
#app {
  display: flex;
  padding: 20px;
  .left {
    width: 600px;
    flex-grow: 1;
    margin-right: 45px;
  }
  .right {
    width: 600px;
    flex-grow: 2;
    padding-left: 50px;
  }
}
.label {
  line-height: 40px;
  padding-right: 25px;
  font-size: 14px;
}
.gene {
  display: flex;
  align-items: center;
  .input-wrapper {
    flex-grow: 1;
    padding-right: 30px;
  }
}
.arr {
  margin-top: 30px;
  .textarea {
    width: 500px;
    margin-left: 30px;
  }
}
.method {
  margin-top: 30px;
  .btns {
    display: flex;
    flex-wrap: wrap;
    margin-left: 30px;
  }
  .btn-wrapper {
    margin: 0 25px 15px 0;
  }
}
.commit {
  margin-top: 30px;
  .btn-wrapper {
    margin-left: 30px;
  }
}
.speed {
  margin-top: 30px;
}
.arr-panel {
  .arr-list {
    list-style: none;
    display: flex;
    align-items: flex-end;
    height: 400px;
  }
  .item {
    width: 40px;
    margin: 0 2px;
    background-color: #add6e6;
    // transition: background-color 0.5s;
    position: relative;
    &.act {
      background-color: transparent !important;
      .move {
        background-color: #0d8000;
      }
    }    
    &.partordered {
      background-color: #e6a233;
    }
    &.blur {
      background-color: #ccc;
    }
    &.ordered {
      background-color: #e24062;
    }
    &.cur{
      background-color: yellowgreen;
    }
    &.down {
      background-color: transparent !important;
      .move {
        bottom: -400px;
        background-color: yellowgreen;
      }
    }
    &.shell {
      background-color: blue;
    }
    .move {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
}
.message{
  text-align: center;
  line-height: 50px;
  font-size: 38px;
  font-weight: 700;
  color:#000;
}
</style>
