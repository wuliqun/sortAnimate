<template>
  <div class="merge">
    <div class="arr-panel" ref="panel">
      <div class="arr-list">
        <div
          class="item"
          v-for="item in sortArr"
          :key="item.id"
          :class="item.className"
          :style="{height:(item.value/max*100).toFixed(2) + '%'}"
          ref="item"
        >
          <div class="move" :style="item.style"></div>
        </div>
      </div>
      <div class="message" v-show="show">{{ message }}</div>
    </div>    
    <div class="extra" ref="extra">
      <div class="left box"></div>
      <div class="right box" ref="right"></div>
    </div>
  </div>
</template>
<script>
let moveConfig = null;
export default {
  props: ["arr", "delay"],
  data() {
    return {
      array: [],
      sortArr: [],
      show: false,
      message: "",
      max: 0
    };
  },
  watch: {
    arr(val) {
      this.init(val);
      if (moveConfig) {
        this.getMoveConfig();
      }
    }
  },
  created() {
    this.init(this.arr);
    window.vm = this;
  },
  mounted() {
    this.getMoveConfig();
  },
  methods: {
    init(arr) {
      this.array = arr.slice();
      this.sortArr = arr.map((item, index) => {
        return {
          id: index + 1,
          value: item,
          className: "",
          style: ""
        };
      });
      this.max = Math.max.apply(null, arr);
    },
    getMoveConfig() {
      let item1 = this.$refs.item[0];
      let item2 = this.$refs.item[1];
      let panel = this.$refs.panel;
      let extra = this.$refs.extra;
      let right = this.$refs.right;
      moveConfig = {
        // 元素宽度
        width: item1.offsetWidth,
        margin: item2.offsetLeft - item1.offsetLeft - item1.offsetWidth,
        // 底部需要移动的距离
        bottom: extra.offsetTop - panel.offsetTop,
        left1: item1.offsetLeft,
        left2: right.offsetLeft
      };
      moveConfig.downWidth = Math.floor(moveConfig.width * 0.45);
      if (moveConfig.margin * 5 > moveConfig.width) {
        moveConfig.downMargin = Math.floor(moveConfig.margin * 0.5);
      } else {
        moveConfig.downMargin = moveConfig.margin;
      }
    },
    async startSort(funcName) {
      let sortGenerator = this[funcName](this.array);
      let res = sortGenerator.next(),
        value;
      while (!res.done && !this.stop) {
        value = res.value;
        switch (value[0]) {
          case "active":
            // 当前要合并的两个数组  变色
            await this.addClassAsync(value[1], "active");
            break;
          case "left":
            this.removeClass(value[1], "active");
            await this.moveLeft(value[1]);
            break;
          case "right":
            this.removeClass(value[1], "active");
            await this.moveRight(value[1]);
            break;
          case "show":
            this.show = true;
            this.message = value[1];
            break;
          case "unshow":
            this.show = false;
            break;
          case "up":
            await this.moveUp(value[1][0],value[1][1]);
            break;
          case "merge":
            await this.merge(value[1],value[2]);
            break;
          case "unsort":
            await this.removeClassAsync(this.generateIndexArr(0,this.sortArr.length - 1),'sorted');
            break;
          case "sort":
            await this.addClassAsync(this.generateIndexArr(0,this.sortArr.length - 1),'sorted');
            break;
        }
        res = sortGenerator.next();
      }
      this.stop = false;
    },
    stopSort(){      
      return new Promise((resolve)=>{
        this.stop = true;
        setTimeout(() => {
          this.init(this.arr);
          this.stop = false;
          resolve();
        }, Math.max(this.delay + 300,300));
      });
    },
    moveLeft(arr) {
      this.addClass(arr, "down");
      let i = 1;
      let left = moveConfig.left1 - this.$refs.item[arr[0]].offsetLeft;
      let tmp = [];
      tmp.push(
        this.move(arr[0], {
          left,
          bottom: -moveConfig.bottom,
          width: moveConfig.downWidth
        })
      );
      while (i < arr.length) {
        tmp.push(
          this.move(arr[i], {
            left:
              left -
              i *
                (moveConfig.width +
                  moveConfig.margin -
                  moveConfig.downWidth -
                  moveConfig.downMargin),
            bottom: -moveConfig.bottom,
            width: moveConfig.downWidth
          })
        );
        i++;
      }
      return Promise.all(tmp);
    },
    moveRight(arr) {
      this.addClass(arr, "down");
      let i = 1;
      let left = moveConfig.left2 - this.$refs.item[arr[0]].offsetLeft;
      let tmp = [];
      tmp.push(
        this.move(arr[0], {
          left,
          bottom: -moveConfig.bottom,
          width: moveConfig.downWidth
        })
      );
      while (i < arr.length) {
        tmp.push(
          this.move(arr[i], {
            left:
              left -
              i *
                (moveConfig.width +
                  moveConfig.margin -
                  moveConfig.downWidth -
                  moveConfig.downMargin),
            bottom: -moveConfig.bottom,
            width: moveConfig.downWidth
          })
        );
        i++;
      }
      return Promise.all(tmp);
    },
    // 将原本i位置的元素,向上移动到j的位置
    // 当前i在下面
    moveUp(i, j) {
      let left = (j-i)*(moveConfig.width + moveConfig.margin);
      return this.move(i,{
        left,
        bottom:0,
        width:moveConfig.width
      });
    },
    // 暗度陈仓  偷偷将归并结果合并到数组sortArr上
    // start sortArr 的起始位置
    // arr 排好序的数组段
    merge(start,arr){
      for(let i = 0;i<arr.length;i++){
        this.sortArr[i+start].className = 'sorted';
        this.sortArr[i+start].style = '';
        this.sortArr[i+start].value = arr[i];
      }
      return new Promise((resolve)=>{
        setTimeout(()=>{
          resolve();
        },this.delay);
      })
    },
    /**
     * 移动动画 仅支持 px 单位
     * index 第几个元素
     * target : {left:200,bottom:300,width:25}
     */
    move(index, target, interval = 30) {
      let delay = Math.max(this.delay, 100);
      let times = Math.floor(delay / interval);
      let targets = [],
        attrs = [],
        speeds = [],
        origin = [];
      let style = window.getComputedStyle(this.$refs.item[index].querySelector('.move'));

      for (let i in target) {
        attrs.push(i);
        targets.push(target[i]);
        origin.push(parseFloat(style[i]) || 0);
        speeds.push(
          Math.ceil((target[i] - (parseFloat(style[i]) || 0)) / times)
        );
      }

      return new Promise(resolve => {
        let i, count, cssText;
        let timer = setInterval(() => {
          count = 0;
          for (i = 0; i < origin.length; i++) {
            origin[i] += speeds[i];
            if (
              (speeds[i] > 0 && origin[i] >= targets[i]) ||
              (speeds[i] < 0 && origin[i] <= targets[i]) || 
              speeds[i] === 0
            ) {
              origin[i] = targets[i];
              count ++;
            }
          }
          if (count === targets.length) {
            cssText = "";
            for (i = 0; i < attrs.length; i++) {
              cssText += attrs[i] + ":";
              cssText += targets[i] + "px;";
            }
            this.sortArr[index].style = cssText;
            clearInterval(timer);
            resolve();
          } else {
            cssText = "";
            for (i = 0; i < attrs.length; i++) {
              cssText += attrs[i] + ":";
              cssText += origin[i] + "px;";
            }
            this.sortArr[index].style = cssText;
          }
        }, interval);
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.arr-panel {
  .arr-list {
    list-style: none;
    display: flex;
    align-items: flex-end;
    height: 300px;
  }
  .item {
    width: 40px;
    margin-right: 4px;
    background-color: #add6e6;
    position: relative;
    &:last-child {
      margin-right: 0;
    }
    &.active {
      background-color: #0d8000;
    }
    &.down {
      background-color: transparent;
      .move {
        background-color: #0d8000;
      }
    }
    &.sorted{
      background-color: #f7a6a0;
    }
    .move {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
}
.extra {
  display: flex;
  height: 300px;
  margin-top: 20px;
  .box {
    flex-grow: 1;
    outline: 1px dashed #ccc;
    height: 100%;
  }
}
.message{
  position: absolute;
  width:600px;
  top:30px;
  right:0;
  text-align: center;
  line-height: 50px;
  font-size: 38px;
  font-weight: 700;
  color:#000;
}
</style>