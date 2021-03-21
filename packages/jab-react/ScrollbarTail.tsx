import React, { ReactNode } from "react";

export type ScrollbarTailProps = {
  style?: React.CSSProperties;
  children: ReactNode;
};

export type Snapshot = boolean;

const ownStyles: React.CSSProperties = {
  overflowY: "auto", //isn't this the most sensible default?
};

/**
 * Keep the scrollbar at bottom, when new content is added.
 *
 * - If the scrollbar isn't at the bottom, it'll stay where it is.
 */
export class ScrollbarTail extends React.Component<ScrollbarTailProps> {
  public scrollingDiv: React.RefObject<HTMLDivElement>;

  constructor(props: ScrollbarTailProps) {
    super(props);

    this.scrollingDiv = React.createRef();
  }

  public componentDidMount() {
    const a = this.scrollingDiv.current;

    if (a) {
      a.scrollTo({ top: 100000 });
    }
  }

  public getSnapshotBeforeUpdate(): Snapshot {
    if (this.scrollingDiv.current) {
      //quick fix for tsc
      const a = this.scrollingDiv.current as any;

      return a.scrollHeight - a.scrollTop - a.clientHeight <= 0;
    } else {
      return false;
    }
  }

  /**
   * Note: smooth scroll is not possible, because it might not finish before a new update comes, and
   *  so it will look like the scrollbar is not at the bottom. Even though it was just about
   *  to get there.
   */
  public componentDidUpdate(
    _prevProps: ScrollbarTailProps,
    _prevState: never,
    scrollAtBottom: Snapshot
  ) {
    const a = this.scrollingDiv.current;

    if (a && scrollAtBottom) {
      a.scrollTo({ top: 100000 });
    }
  }

  public render() {
    return (
      <div
        ref={this.scrollingDiv}
        style={{ ...this.props.style, ...ownStyles }}
      >
        {this.props.children}
      </div>
    );
  }
}
