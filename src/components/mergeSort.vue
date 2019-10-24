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
      }else{
        moveConfig.downMargin = moveConfig.margin;
      }
    },
    async startSort(funcName) {
      let sortGenerator = this[funcName](this.array);
      let res = sortGenerator.next(),
        value;
      while (!res.done) {
        value = res.value;
        switch (value[0]) {
          case "active":
            // 当前要合并的两个数组  变色
            await this.addClassAsync(value[1], "active");
            break;
          case "moveLeft":
            this.removeClass(value[1], "active");
            await this.moveLeft(value[1]);
            break;
          case "moveRight":
            this.removeClass(value[1], "active");
            await this.moveRight(value[1]);
            break;
        }
      }
    },
    moveLeft(arr) {
      this.addClass(arr, "down");
      let i = 1;
      let left = moveConfig.left1 - this.$refs.item[arr[0]].offsetLeft;
      let tmp = [];
      tmp.push(this.move(arr[0], left));
      while (i < arr.length) {
        tmp.push(this.move(
          arr[i],
          left -
            i *
              (moveConfig.width +
                moveConfig.margin -
                moveConfig.downWidth -
                moveConfig.downMargin)
        ));
        i++;
      }
      return Promise.all(tmp);
    },
    moveRight(arr) {
      this.addClass(arr, "down");
      let i = 1;
      let left = moveConfig.left2 - this.$refs.item[arr[0]].offsetLeft;
      let tmp = [];
      tmp.push(this.move(arr[0], left));
      while (i < arr.length) {
        tmp.push(this.move(
          arr[i],
          left -
            i *
              (moveConfig.width +
                moveConfig.margin -
                moveConfig.downWidth -
                moveConfig.downMargin)
        ));
        i++;
      }
      return Promise.all(tmp);
    },
    // 将原本i位置的元素,向上移动到j的位置
    // 当前i在下面
    moveUp(i,j){

    },
    move(index, left, interval = 30) {
      return new Promise(resolve => {
        let bottom = -moveConfig.bottom;
        let width = moveConfig.downWidth;
        let originWidth = moveConfig.width;
        let delay = Math.max(this.delay, 100);
        let times = Math.floor(delay / interval);
        let targets = [bottom, left, width];
        let speeds = [
          bottom / times,
          left / times,
          (width - originWidth) / times
        ];
        let origins = [0, 0, originWidth];
        let i, isEnd;
        let timer = setInterval(() => {
          isEnd = false;
          for (i = 0; i < origins.length; i++) {
            origins[i] += speeds[i];
            if (
              (speeds[i] > 0 && origins[i] >= targets[i]) ||
              (speeds[i] < 0 && origins[i] <= targets[i])
            ) {
              isEnd = true;
              break;
            }
          }
          if (isEnd) {
            this.sortArr[index].style = `bottom:${targets[0]}px;left:${
              targets[1]
            }px;width:${targets[2]}px;`;
            clearInterval(timer);
            resolve();
          } else {
            this.sortArr[index].style = `bottom:${origins[0]}px;left:${
              origins[1]
            }px;width:${origins[2]}px;`;
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
</style>